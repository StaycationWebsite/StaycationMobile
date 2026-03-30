import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, ScrollView,
  RefreshControl, Modal, TextInput, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Styles';
import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import { inventoryService, InventoryItem as ApiInventoryItem } from '../../../../services/inventoryService';

// ─── Types ────────────────────────────────────────────────────────────────────
type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

interface InventoryItem {
  id: number;
  apiId: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestocked: string;
  status: StockStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const UNIT_OPTIONS = ['pcs', 'sets', 'boxes', 'bottles', 'rolls', 'bags'];
const PREDEFINED_CATEGORIES = [
  'Guest Amenities',
  'Bathroom Supplies',
  'Cleaning Supplies',
  'Linens & Bedding',
  'Kitchen Supplies',
  'Add ons',
];

function mapApiInventory(raw: ApiInventoryItem, index: number): InventoryItem {
  return {
    id: index + 1,
    apiId: raw.item_id,
    name: raw.item_name,
    category: raw.category,
    quantity: raw.current_stock,
    minQuantity: raw.minimum_stock,
    unit: raw.unit_type,
    lastRestocked: raw.last_restocked
      ? new Date(raw.last_restocked).toLocaleDateString()
      : '—',
    status: computeStatus(raw.current_stock, raw.minimum_stock),
  };
}

const computeStatus = (quantity: number, minQuantity: number): StockStatus => {
  if (quantity === 0) return 'Out of Stock';
  if (quantity <= minQuantity) return 'Low Stock';
  return 'In Stock';
};

const CATEGORY_ICON_MAP: Record<string, { icon: string; bgColor: string; iconColor: string }> = {
  'Guest Amenities':   { icon: 'coffee',          bgColor: Colors.green[100],          iconColor: Colors.green[500] },
  'Bathroom Supplies': { icon: 'spray-bottle',    bgColor: Colors.purple[500] + '20',  iconColor: Colors.purple[500] },
  'Cleaning Supplies': { icon: 'broom',           bgColor: Colors.blue[100],           iconColor: Colors.blue[500] },
  'Linens & Bedding':  { icon: 'bed',             bgColor: Colors.blue[100],           iconColor: Colors.blue[500] },
  'Kitchen Supplies':  { icon: 'silverware-fork-knife', bgColor: Colors.yellow[100],   iconColor: Colors.yellow[500] },
  'Add ons':           { icon: 'plus-box-outline',bgColor: Colors.blue[100],           iconColor: Colors.blue[500] },
  // legacy
  Linens:      { icon: 'bed',             bgColor: Colors.blue[100],           iconColor: Colors.blue[500] },
  Toiletries:  { icon: 'spray-bottle',    bgColor: Colors.purple[500] + '20',  iconColor: Colors.purple[500] },
  Amenities:   { icon: 'coffee',          bgColor: Colors.green[100],          iconColor: Colors.green[500] },
  Maintenance: { icon: 'tools',           bgColor: Colors.yellow[100],         iconColor: Colors.yellow[500] },
};

const DEFAULT_CATEGORY_ICON = { icon: 'package-variant', bgColor: Colors.gray[100], iconColor: Colors.gray[500] };

function getCategoryConfig(category: string) {
  return CATEGORY_ICON_MAP[category] ?? DEFAULT_CATEGORY_ICON;
}

// ─── Selector Row Component ────────────────────────────────────────────────────
const SelectorRow = ({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.selectorChip, value === opt && styles.selectorChipActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.selectorChipText, value === opt && styles.selectorChipTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// ─── Bottom Sheet Wrapper ─────────────────────────────────────────────────────
const BottomSheet = ({ visible, onClose, title, subtitle, children }: {
  visible: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>{title}</Text>
            {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
          </View>
          <TouchableOpacity style={styles.sheetCloseBtn} onPress={onClose}>
            <Feather name="x" size={18} color={Colors.gray[600]} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InventoryManagementScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal visibility
  const [addModalVisible, setAddModalVisible]       = useState(false);
  const [updateTarget, setUpdateTarget]             = useState<InventoryItem | null>(null);
  const [restockTarget, setRestockTarget]           = useState<InventoryItem | null>(null);

  // Add form state
  const emptyAddForm = { name: '', category: PREDEFINED_CATEGORIES[0], quantity: '', minQuantity: '', unit: '', price: '' };
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  // Update form state
  const [updateForm, setUpdateForm] = useState({ name: '', quantity: '', minQuantity: '', unit: 'pcs' });
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  // Restock form state
  const [restockQty, setRestockQty] = useState('');
  const [restockNote, setRestockNote] = useState('');
  const [restockError, setRestockError] = useState('');

  // ── Data fetching ──
  const fetchInventory = useCallback(async () => {
    try {
      const data = await inventoryService.getInventory();
      const mapped = data.map(mapApiInventory);
      setInventory(mapped);
      const unique = Array.from(new Set(mapped.map(i => i.category).filter(Boolean)));
      setCategories(unique);
      setAddForm(prev => ({ ...prev, category: prev.category || unique[0] || '' }));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load inventory');
    }
  }, []);

  useEffect(() => { fetchInventory().finally(() => setLoading(false)); }, [fetchInventory]);

  // ── Helpers ──
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  };

  const filtered = inventory.filter(i => {
    const matchCategory = activeFilter === 'All' || i.category === activeFilter;
    const matchStatus   = activeStatus === 'All Status' || i.status === activeStatus;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch   = !q || i.name.toLowerCase().includes(q) || i.apiId.toLowerCase().includes(q);
    return matchCategory && matchStatus && matchSearch;
  });

  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  // ── Add Item ──
  const setAddField = (key: string, value: string) => {
    setAddForm(prev => ({ ...prev, [key]: value }));
    if (addErrors[key]) setAddErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateAdd = () => {
    const e: Record<string, string> = {};
    if (!addForm.name.trim())         e.name        = 'Item name is required';
    if (!addForm.quantity.trim())     e.quantity    = 'Quantity is required';
    else if (isNaN(Number(addForm.quantity)) || Number(addForm.quantity) < 0)
                                      e.quantity    = 'Enter a valid number';
    if (!addForm.minQuantity.trim())  e.minQuantity = 'Min quantity is required';
    else if (isNaN(Number(addForm.minQuantity)) || Number(addForm.minQuantity) < 0)
                                      e.minQuantity = 'Enter a valid number';
    setAddErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validateAdd()) return;
    const qty = Number(addForm.quantity);
    const minQty = Number(addForm.minQuantity);
    try {
      const created = await inventoryService.addItem({
        item_name: addForm.name.trim(),
        category: addForm.category,
        current_stock: qty,
        minimum_stock: minQty,
        unit_type: addForm.unit.trim(),
        price_per_unit: addForm.price.trim() || '0',
      });
      setInventory(prev => [mapApiInventory(created, 0), ...prev.map((i, idx) => ({ ...i, id: idx + 2 }))]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add item');
      return;
    }
    setAddModalVisible(false);
    setAddForm(emptyAddForm);
    setAddErrors({});
  };

  const closeAdd = () => {
    setAddModalVisible(false);
    setAddForm(emptyAddForm);
    setAddErrors({});
  };

  // ── Update Item ──
  const openUpdate = (item: InventoryItem) => {
    setUpdateTarget(item);
    setUpdateForm({
      name: item.name,
      quantity: String(item.quantity),
      minQuantity: String(item.minQuantity),
      unit: item.unit,
    });
    setUpdateErrors({});
  };

  const setUpdateField = (key: string, value: string) => {
    setUpdateForm(prev => ({ ...prev, [key]: value }));
    if (updateErrors[key]) setUpdateErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateUpdate = () => {
    const e: Record<string, string> = {};
    if (!updateForm.name.trim())         e.name        = 'Item name is required';
    if (!updateForm.quantity.trim())     e.quantity    = 'Quantity is required';
    else if (isNaN(Number(updateForm.quantity)) || Number(updateForm.quantity) < 0)
                                         e.quantity    = 'Enter a valid number';
    if (!updateForm.minQuantity.trim())  e.minQuantity = 'Min quantity is required';
    else if (isNaN(Number(updateForm.minQuantity)) || Number(updateForm.minQuantity) < 0)
                                         e.minQuantity = 'Enter a valid number';
    setUpdateErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateUpdate() || !updateTarget) return;
    const qty = Number(updateForm.quantity);
    const minQty = Number(updateForm.minQuantity);
    try {
      await inventoryService.updateItem(updateTarget.apiId, {
        item_name: updateForm.name.trim(),
        current_stock: qty,
        minimum_stock: minQty,
        unit_type: updateForm.unit,
      });
      setInventory(prev => prev.map(i =>
        i.id === updateTarget.id
          ? { ...i, name: updateForm.name.trim(), quantity: qty, minQuantity: minQty, unit: updateForm.unit, status: computeStatus(qty, minQty) }
          : i
      ));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update item');
      return;
    }
    setUpdateTarget(null);
    setUpdateErrors({});
  };

  const closeUpdate = () => {
    setUpdateTarget(null);
    setUpdateErrors({});
  };

  // ── Restock Item ──
  const openRestock = (item: InventoryItem) => {
    setRestockTarget(item);
    setRestockQty('');
    setRestockNote('');
    setRestockError('');
  };

  const handleRestock = async () => {
    if (!restockQty.trim() || isNaN(Number(restockQty)) || Number(restockQty) <= 0) {
      setRestockError('Enter a valid quantity to add');
      return;
    }
    if (!restockTarget) return;
    const addQty = Number(restockQty);
    try {
      await inventoryService.restockItem(restockTarget.apiId, addQty, restockNote || undefined);
      setInventory(prev => prev.map(i => {
        if (i.id !== restockTarget.id) return i;
        const newQty = i.quantity + addQty;
        return { ...i, quantity: newQty, lastRestocked: new Date().toLocaleDateString(), status: computeStatus(newQty, i.minQuantity) };
      }));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to restock item');
      return;
    }
    setRestockTarget(null);
    setRestockQty('');
    setRestockNote('');
    setRestockError('');
  };

  const closeRestock = () => {
    setRestockTarget(null);
    setRestockQty('');
    setRestockNote('');
    setRestockError('');
  };

  // ── Inventory Card ──
  const InventoryCard = ({ item }: { item: InventoryItem }) => {
    const cfg = getCategoryConfig(item.category);
    return (
      <Card style={styles.inventoryCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.itemInfo}>
            <View style={[styles.iconBox, { backgroundColor: cfg.bgColor }]}>
              <MaterialCommunityIcons name={cfg.icon as any} size={22} color={cfg.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
          </View>
          <Badge
            label={item.status}
            variant={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'}
            size="sm"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.quantitySection}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Current Stock</Text>
            <Text style={[styles.quantityValue, {
              color: item.quantity <= item.minQuantity ? Colors.red[500] : Colors.brand.primary,
            }]}>{item.quantity} {item.unit}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, {
                width: `${Math.min((item.quantity / (item.minQuantity * 3)) * 100, 100)}%`,
                backgroundColor: item.quantity === 0 ? Colors.red[500] :
                  item.quantity <= item.minQuantity ? Colors.red[500] :
                  item.quantity <= item.minQuantity * 2 ? Colors.yellow[500] :
                  Colors.green[500],
              }]}
            />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Min: {item.minQuantity} {item.unit}</Text>
            <Text style={styles.metaText}>Last restocked: {item.lastRestocked}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.updateButton} onPress={() => openUpdate(item)}>
            <Feather name="edit-3" size={14} color={Colors.brand.primary} />
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restockButton} onPress={() => openRestock(item)}>
            <Feather name="package" size={14} color={Colors.white} />
            <Text style={styles.restockText}>Restock</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Inventory Management</Text>
          <Text style={styles.headerSubtitle}>{inventory.length} items tracked</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Feather name="plus" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand.primary} />}
      >
        {/* Alert Banner */}
        {lowStockCount > 0 && (
          <View style={styles.alertBanner}>
            <MaterialCommunityIcons name="alert" size={20} color={Colors.red[500]} />
            <Text style={styles.alertText}>
              {lowStockCount} {lowStockCount === 1 ? 'item needs' : 'items need'} restocking
            </Text>
          </View>
        )}

        {/* KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: '#E91E8C' }]}>
            <MaterialCommunityIcons name="package-variant-closed" size={22} color="rgba(255,255,255,0.5)" />
            <Text style={styles.kpiValue}>{inventory.length}</Text>
            <Text style={styles.kpiLabel}>Total Items</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#22C55E' }]}>
            <MaterialCommunityIcons name="trending-up" size={22} color="rgba(255,255,255,0.5)" />
            <Text style={styles.kpiValue}>{inventory.filter(i => i.status === 'In Stock').length}</Text>
            <Text style={styles.kpiLabel}>In Stock</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#F59E0B' }]}>
            <MaterialCommunityIcons name="pulse" size={22} color="rgba(255,255,255,0.5)" />
            <Text style={styles.kpiValue}>{inventory.filter(i => i.status === 'Low Stock').length}</Text>
            <Text style={styles.kpiLabel}>Low Stock</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: '#EF4444' }]}>
            <MaterialCommunityIcons name="trending-down" size={22} color="rgba(255,255,255,0.5)" />
            <Text style={styles.kpiValue}>{inventory.filter(i => i.status === 'Out of Stock').length}</Text>
            <Text style={styles.kpiLabel}>Out of Stock</Text>
          </View>
        </ScrollView>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Feather name="search" size={14} color={Colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID..."
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={14} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status + Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
          {['All Status', 'In Stock', 'Low Stock', 'Out of Stock'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, activeStatus === s && styles.chipActive]}
              onPress={() => setActiveStatus(s)}
            >
              <Text style={[styles.chipText, activeStatus === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.chipDivider} />
          {['All', ...categories].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.chip, activeFilter === tab && styles.chipActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.chipText, activeFilter === tab && styles.chipTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="package-variant-closed" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          ) : (
            filtered.map(item => <InventoryCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>

      {/* ── ADD ITEM MODAL ───────────────────────────────────────────── */}
      <BottomSheet
        visible={addModalVisible}
        onClose={closeAdd}
        title="Add Inventory Item"
        subtitle="Track a new supply or resource"
      >
        <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* Item Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Item Name</Text>
            <View style={[styles.inputWrapper, addErrors.name && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bath Towel"
                placeholderTextColor={Colors.gray[400]}
                value={addForm.name}
                onChangeText={v => setAddField('name', v)}
              />
            </View>
            {addErrors.name ? <Text style={styles.errorText}>{addErrors.name}</Text> : null}
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
              {PREDEFINED_CATEGORIES.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.selectorChip, addForm.category === opt && styles.selectorChipActive]}
                  onPress={() => setAddField('category', opt)}
                >
                  <Text style={[styles.selectorChipText, addForm.category === opt && styles.selectorChipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {addErrors.category ? <Text style={styles.errorText}>{addErrors.category}</Text> : null}
          </View>

          {/* Current Stock & Minimum Stock */}
          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Current Stock</Text>
              <View style={[styles.inputWrapper, addErrors.quantity && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  value={addForm.quantity}
                  onChangeText={v => setAddField('quantity', v)}
                />
              </View>
              {addErrors.quantity ? <Text style={styles.errorText}>{addErrors.quantity}</Text> : null}
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Minimum Stock</Text>
              <View style={[styles.inputWrapper, addErrors.minQuantity && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  value={addForm.minQuantity}
                  onChangeText={v => setAddField('minQuantity', v)}
                />
              </View>
              {addErrors.minQuantity ? <Text style={styles.errorText}>{addErrors.minQuantity}</Text> : null}
            </View>
          </View>

          {/* Unit Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Unit Type</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. pcs, bottles, sets"
                placeholderTextColor={Colors.gray[400]}
                value={addForm.unit}
                onChangeText={v => setAddField('unit', v)}
              />
            </View>
          </View>

          {/* Price Per Unit (Optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Price Per Unit <Text style={styles.optionalLabel}>(Optional)</Text></Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="numeric"
                value={addForm.price}
                onChangeText={v => setAddField('price', v)}
              />
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={closeAdd}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
            <Feather name="plus" size={16} color={Colors.white} />
            <Text style={styles.submitBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* ── UPDATE ITEM MODAL ────────────────────────────────────────── */}
      <BottomSheet
        visible={!!updateTarget}
        onClose={closeUpdate}
        title="Update Item"
        subtitle={updateTarget ? `Editing ${updateTarget.name}` : undefined}
      >
        <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* Item Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Item Name</Text>
            <View style={[styles.inputWrapper, updateErrors.name && styles.inputError]}>
              <TextInput
                style={styles.input}
                placeholder="Item name"
                placeholderTextColor={Colors.gray[400]}
                value={updateForm.name}
                onChangeText={v => setUpdateField('name', v)}
              />
            </View>
            {updateErrors.name ? <Text style={styles.errorText}>{updateErrors.name}</Text> : null}
          </View>

          {/* Unit Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Unit Type</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. pcs, bottles, sets"
                placeholderTextColor={Colors.gray[400]}
                value={updateForm.unit}
                onChangeText={v => setUpdateField('unit', v)}
              />
            </View>
          </View>

          {/* Stock & Min Stock */}
          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Current Stock</Text>
              <View style={[styles.inputWrapper, updateErrors.quantity && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  value={updateForm.quantity}
                  onChangeText={v => setUpdateField('quantity', v)}
                />
              </View>
              {updateErrors.quantity ? <Text style={styles.errorText}>{updateErrors.quantity}</Text> : null}
            </View>
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Minimum Stock</Text>
              <View style={[styles.inputWrapper, updateErrors.minQuantity && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="numeric"
                  value={updateForm.minQuantity}
                  onChangeText={v => setUpdateField('minQuantity', v)}
                />
              </View>
              {updateErrors.minQuantity ? <Text style={styles.errorText}>{updateErrors.minQuantity}</Text> : null}
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={closeUpdate}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
            <Feather name="check" size={16} color={Colors.white} />
            <Text style={styles.submitBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* ── RESTOCK MODAL ───────────────────────────────────────────── */}
      <BottomSheet
        visible={!!restockTarget}
        onClose={closeRestock}
        title="Restock Item"
        subtitle={restockTarget ? `Adding stock to ${restockTarget.name}` : undefined}
      >
        <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* Current Stock Info */}
          {restockTarget && (
            <View style={styles.restockInfoCard}>
              <View style={styles.restockInfoRow}>
                <View style={[styles.restockInfoIconBox, { backgroundColor: getCategoryConfig(restockTarget.category).bgColor }]}>
                  <MaterialCommunityIcons name={getCategoryConfig(restockTarget.category).icon as any} size={20} color={getCategoryConfig(restockTarget.category).iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.restockInfoName}>{restockTarget.name}</Text>
                  <Text style={styles.restockInfoMeta}>{restockTarget.category}</Text>
                </View>
              </View>
              <View style={styles.restockStatRow}>
                <View style={styles.restockStat}>
                  <Text style={styles.restockStatValue}>{restockTarget.quantity}</Text>
                  <Text style={styles.restockStatLabel}>Current</Text>
                </View>
                <MaterialCommunityIcons name="arrow-right" size={20} color={Colors.gray[400]} />
                <View style={styles.restockStat}>
                  <Text style={[styles.restockStatValue, { color: Colors.brand.primary }]}>
                    {restockQty ? restockTarget.quantity + Number(restockQty) : '—'}
                  </Text>
                  <Text style={styles.restockStatLabel}>After Restock</Text>
                </View>
                <View style={styles.restockStat}>
                  <Text style={styles.restockStatValue}>{restockTarget.minQuantity}</Text>
                  <Text style={styles.restockStatLabel}>Minimum</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quantity to Add */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Quantity to Add</Text>
            <View style={[styles.inputWrapper, restockError && styles.inputError, styles.restockQtyInput]}>
              <TextInput
                style={[styles.input, { fontSize: 20, fontWeight: '700', textAlign: 'center' }]}
                placeholder="0"
                placeholderTextColor={Colors.gray[300]}
                keyboardType="numeric"
                value={restockQty}
                onChangeText={v => { setRestockQty(v); setRestockError(''); }}
              />
            </View>
            {restockTarget && (
              <Text style={styles.restockUnitHint}>Units in {restockTarget.unit}</Text>
            )}
            {restockError ? <Text style={styles.errorText}>{restockError}</Text> : null}
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Quick Add</Text>
            <View style={styles.quickAmountRow}>
              {[5, 10, 20, 50].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.quickAmountBtn, restockQty === String(n) && styles.quickAmountBtnActive]}
                  onPress={() => { setRestockQty(String(n)); setRestockError(''); }}
                >
                  <Text style={[styles.quickAmountText, restockQty === String(n) && styles.quickAmountTextActive]}>+{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Note (optional)</Text>
            <View style={[styles.inputWrapper, { height: 80 }]}>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top', paddingTop: 8 }]}
                placeholder="e.g. New delivery from supplier..."
                placeholderTextColor={Colors.gray[400]}
                multiline
                value={restockNote}
                onChangeText={setRestockNote}
              />
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={closeRestock}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: Colors.green[500] }]} onPress={handleRestock}>
            <Feather name="package" size={16} color={Colors.white} />
            <Text style={styles.submitBtnText}>Confirm Restock</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray[900] },
  headerSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  addButton: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.brand.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },

  // Alert
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 16, padding: 14,
    backgroundColor: Colors.red[100], borderRadius: 12,
    borderLeftWidth: 4, borderLeftColor: Colors.red[500],
  },
  alertText: { fontSize: 13, fontWeight: '600', color: Colors.red[500], flex: 1 },

  // KPI Cards
  kpiRow: {
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    flexDirection: 'row',
  },
  kpiCard: {
    width: 90, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 10,
    alignItems: 'center', gap: 4,
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: Colors.white },
  kpiLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  // Filters
  // Search
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 10, marginBottom: 6,
    backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[900], paddingVertical: 0 },

  // Filters
  filterChips: { paddingHorizontal: 16, paddingBottom: 10, gap: 6, alignItems: 'center' },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.gray[100], borderWidth: 1, borderColor: Colors.gray[200],
  },
  chipDivider: { width: 1, height: 20, backgroundColor: Colors.gray[300], marginHorizontal: 2 },
  chipActive: { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.gray[600] },
  chipTextActive: { color: Colors.white },

  // Content
  content: { padding: 20, gap: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.gray[400], fontWeight: '500' },

  // Inventory Card
  inventoryCard: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  itemCategory: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginBottom: 12 },
  quantitySection: { marginBottom: 12 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  quantityLabel: { fontSize: 12, color: Colors.gray[600] },
  quantityValue: { fontSize: 16, fontWeight: '700' },
  progressBarBg: { height: 6, backgroundColor: Colors.gray[100], borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 11, color: Colors.gray[500] },
  actionRow: { flexDirection: 'row', gap: 10 },
  updateButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.brand.primarySoft,
  },
  updateText: { fontSize: 13, fontWeight: '600', color: Colors.brand.primary },
  restockButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.brand.primary,
  },
  restockText: { fontSize: 13, fontWeight: '600', color: Colors.white },

  // Modal / Bottom Sheet
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomSheet: {
    backgroundColor: Colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '92%', paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray[300],
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  sheetSubtitle: { fontSize: 13, color: Colors.gray[500], marginTop: 2 },
  sheetCloseBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center',
  },
  sheetContent: { paddingHorizontal: 24, paddingTop: 20 },

  // Form fields
  fieldGroup: { gap: 6, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray[700], marginBottom: 6 },
  optionalLabel: { fontSize: 12, fontWeight: '400', color: Colors.gray[400] },
  inputWrapper: {
    borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 12,
    backgroundColor: Colors.gray[50], paddingHorizontal: 14, height: 48, justifyContent: 'center',
  },
  inputError: { borderColor: Colors.red[500] },
  input: { fontSize: 14, color: Colors.gray[900] },
  errorText: { fontSize: 11, color: Colors.red[500], marginTop: 2 },
  twoColRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },

  // Selector chips
  selectorRow: { gap: 8, paddingVertical: 2 },
  selectorChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.gray[100], borderWidth: 1, borderColor: Colors.gray[200],
  },
  selectorChipActive: { backgroundColor: Colors.brand.primarySoft, borderColor: Colors.brand.primary },
  selectorChipText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
  selectorChipTextActive: { color: Colors.brand.primaryDark },

  // Preview card
  previewCard: {
    backgroundColor: Colors.brand.primarySoft, borderRadius: 14, padding: 14, gap: 10,
    borderWidth: 1, borderColor: Colors.brand.primaryLight, marginBottom: 16,
  },
  previewLabel: { fontSize: 10, fontWeight: '700', color: Colors.brand.primaryDark, letterSpacing: 1 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  previewName: { fontSize: 14, fontWeight: '700', color: Colors.gray[900] },
  previewMeta: { fontSize: 11, color: Colors.gray[500], marginTop: 2 },
  previewStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  previewStatusText: { fontSize: 10, fontWeight: '700' },

  // Restock modal
  restockInfoCard: {
    backgroundColor: Colors.gray[50], borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.gray[100], marginBottom: 16, gap: 12,
  },
  restockInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  restockInfoIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  restockInfoName: { fontSize: 15, fontWeight: '700', color: Colors.gray[900] },
  restockInfoMeta: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  restockStatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  restockStat: { alignItems: 'center', flex: 1 },
  restockStatValue: { fontSize: 18, fontWeight: '700', color: Colors.gray[900] },
  restockStatLabel: { fontSize: 10, color: Colors.gray[500], marginTop: 2 },
  restockQtyInput: { height: 64, justifyContent: 'center' },
  restockUnitHint: { fontSize: 11, color: Colors.gray[400], textAlign: 'center' },
  quickAmountRow: { flexDirection: 'row', gap: 10 },
  quickAmountBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.gray[100], alignItems: 'center',
    borderWidth: 1, borderColor: Colors.gray[200],
  },
  quickAmountBtnActive: { backgroundColor: Colors.brand.primarySoft, borderColor: Colors.brand.primary },
  quickAmountText: { fontSize: 14, fontWeight: '700', color: Colors.gray[600] },
  quickAmountTextActive: { color: Colors.brand.primaryDark },

  // Sheet actions
  sheetActions: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 24, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: Colors.gray[100],
  },
  cancelBtn: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.gray[100],
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  submitBtn: {
    flex: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.brand.primary,
    shadowColor: Colors.brand.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});