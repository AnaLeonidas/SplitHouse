import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { Colors } from '../../constants/theme';

export interface StoreItem {
  id: string;
  title: string;
  category: 'Folga' | 'Convivência' | 'Bônus';
  subtitle: string;
  cost: number;
  description: string;
  availability: string;
  iconType: 'minus-circle' | 'tv' | 'sofa' | 'pizza';
}

interface StoreScreenProps {
  houseName?: string;
  initialCoins?: number;
  items?: StoreItem[];
  onBackPress?: () => void;
  onProposePress?: () => void;
  onRedeemPress?: (item: StoreItem) => void;
}

const defaultItems: StoreItem[] = [
  {
    id: '1',
    title: 'Isenção da louça',
    category: 'Folga',
    subtitle: 'Fim de semana livre',
    cost: 150,
    description:
      'Fique livre da louça de almoço e jantar no sábado e domingo. A escala pula para o próximo.',
    availability: '2 vagas no mês',
    iconType: 'minus-circle',
  },
  {
    id: '2',
    title: 'Escolha do filme',
    category: 'Convivência',
    subtitle: 'Sessão de sexta-feira',
    cost: 80,
    description:
      'Controle remoto exclusivo da TV da sala.',
    availability: 'Disponível semanalmente',
    iconType: 'tv',
  },
  {
    id: '3',
    title: 'Rei do sofá retrátil',
    category: 'Convivência',
    subtitle: 'Reserva por 7 dias',
    cost: 200,
    description:
      'Preferência assegurada no assento de preferência.',
    availability: '1 morador por ciclo',
    iconType: 'sofa',
  },
  {
    id: '4',
    title: 'Pizza coletiva',
    category: 'Bônus',
    subtitle: 'Fundo comum da casa',
    cost: 350,
    description:
      'Pizza grande com borda recheada financiado pela caixinha de bônus.',
    availability: '1 disponível',
    iconType: 'pizza',
  },
];

type CategoryFilter = 'all' | 'Folga' | 'Convivência' | 'Bônus';

export const StoreScreen: React.FC<StoreScreenProps> = ({
  houseName = 'República do Sexteto Sinistro',
  initialCoins = 420,
  items = defaultItems,
  onBackPress,
  onProposePress,
  onRedeemPress,
}) => {
  const [coins, setCoins] = useState(initialCoins);
  const [storeItems, setStoreItems] = useState<StoreItem[]>(items);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [isProposeModalVisible, setIsProposeModalVisible] = useState(false);

  const [propTitle, setPropTitle] = useState('');
  const [propCategory, setPropCategory] = useState<'Folga' | 'Convivência' | 'Bônus'>('Folga');
  const [propCost, setPropCost] = useState('100');
  const [propDescription, setPropDescription] = useState('');

  const countFor = (cat: CategoryFilter) => {
    if (cat === 'all') return storeItems.length;
    return storeItems.filter((i) => i.category === cat).length;
  };

  const filteredItems =
    activeCategory === 'all'
      ? storeItems
      : storeItems.filter((i) => i.category === activeCategory);

  const handleRedeem = (item: StoreItem) => {
    if (coins < item.cost) {
      Alert.alert(
        'Saldo insuficiente',
        `Você precisa de ${item.cost} moedas para resgatar "${item.title}". Seu saldo atual é de ${coins} moedas.`
      );
      return;
    }

    Alert.alert(
      'Resgatar Recompensa',
      `Deseja trocar ${item.cost} moedas por "${item.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setCoins((prev) => prev - item.cost);
            if (onRedeemPress) {
              onRedeemPress(item);
            }
            Alert.alert(
              'Recompensa Resgatada!',
              `Você resgatou "${item.title}". A república foi informada e seu benefício já está ativo.`
            );
          },
        },
      ]
    );
  };

  const handleCreateProposal = () => {
    if (!propTitle.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, informe o título da recompensa.');
      return;
    }

    const costNum = parseInt(propCost, 10);
    if (isNaN(costNum) || costNum <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor válido em moedas.');
      return;
    }

    const newItem: StoreItem = {
      id: String(Date.now()),
      title: propTitle.trim(),
      category: propCategory,
      subtitle: 'Proposta de morador',
      cost: costNum,
      description: propDescription.trim() || 'Benefício proposto pelos membros da casa.',
      availability: 'Em votação',
      iconType: propCategory === 'Folga' ? 'minus-circle' : propCategory === 'Convivência' ? 'tv' : 'pizza',
    };

    setStoreItems((prev) => [newItem, ...prev]);
    setPropTitle('');
    setPropDescription('');
    setPropCost('100');
    setIsProposeModalVisible(false);

    Alert.alert('Proposta enviada!', 'Sua proposta de recompensa foi adicionada ao catálogo da moradia.');
  };

  const renderItemIcon = (iconType: StoreItem['iconType'], category: StoreItem['category']) => {
    if (iconType === 'minus-circle') {
      return (
        <View style={styles.iconBoxPurple}>
          <Feather name="minus-circle" size={20} color={Colors.primary} />
        </View>
      );
    }
    if (iconType === 'tv') {
      return (
        <View style={styles.iconBoxLilac}>
          <Feather name="tv" size={20} color={Colors.primary} />
        </View>
      );
    }
    if (iconType === 'sofa') {
      return (
        <View style={styles.iconBoxGray}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 19v-3M18 19v-3M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5H4z"
              stroke={Colors.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      );
    }
    return (
      <View style={styles.iconBoxPurple}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2L2 22h20L12 2z"
            stroke={Colors.primary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Svg height="320" width="320" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="storeTopGlow" cx="60%" cy="30%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="320" height="320" fill="url(#storeTopGlow)" />
      </Svg>

      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          {onBackPress && (
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.8}
              onPress={onBackPress}
            >
              <Feather name="chevron-left" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>Loja da casa</Text>
            <Text style={styles.headerSubtitle}>{houseName}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.proposeButton}
          activeOpacity={0.85}
          onPress={() => {
            if (onProposePress) {
              onProposePress();
            } else {
              setIsProposeModalVisible(true);
            }
          }}
        >
          <Feather name="plus" size={16} color="#FCFCFC" />
          <Text style={styles.proposeButtonText}>Propor</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <View style={styles.balanceWeekBadge}>
              <Text style={styles.balanceWeekText}>+35 esta semana</Text>
            </View>
          </View>

          <View style={styles.balanceMiddleRow}>
            <View style={styles.coinIconBoxLarge}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx={12}
                  cy={12}
                  r={9}
                  stroke="#CC92C2"
                  strokeWidth={2.5}
                  fill="#CC92C2"
                  fillOpacity={0.5}
                />
                <Circle
                  cx={12}
                  cy={12}
                  r={4.5}
                  stroke="#CC92C2"
                  strokeWidth={2.5}
                />
              </Svg>
            </View>
            <Text style={styles.balanceNumber}>{coins}</Text>
            <Text style={styles.balanceCoinsText}>moedas acumuladas</Text>
          </View>

          <Text style={styles.balanceHintText}>
            Troque suas moedas ganhas em tarefas por folgas e benefícios combinados.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsRow}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'all' && styles.categoryPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveCategory('all')}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'all' && styles.categoryPillTextActive,
              ]}
            >
              Todas ({countFor('all')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'Folga' && styles.categoryPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveCategory('Folga')}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'Folga' && styles.categoryPillTextActive,
              ]}
            >
              Folgas ({countFor('Folga')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'Convivência' && styles.categoryPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveCategory('Convivência')}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'Convivência' && styles.categoryPillTextActive,
              ]}
            >
              Convivência ({countFor('Convivência')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'Bônus' && styles.categoryPillActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setActiveCategory('Bônus')}
          >
            <Text
              style={[
                styles.categoryPillText,
                activeCategory === 'Bônus' && styles.categoryPillTextActive,
              ]}
            >
              Bônus ({countFor('Bônus')})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.itemsListContainer}>
          {filteredItems.map((item) => {
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={styles.itemLeftGroup}>
                    {renderItemIcon(item.iconType, item.category)}

                    <View style={styles.itemTitleCol}>
                      <View style={styles.titleBadgeRow}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View
                          style={[
                            styles.categoryBadge,
                            item.category === 'Folga'
                              ? styles.categoryBadgeFolga
                              : item.category === 'Convivência'
                              ? styles.categoryBadgeConvivencia
                              : styles.categoryBadgeBonus,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              item.category === 'Folga'
                                ? styles.categoryBadgeTextFolga
                                : item.category === 'Convivência'
                                ? styles.categoryBadgeTextConvivencia
                                : styles.categoryBadgeTextBonus,
                            ]}
                          >
                            {item.category}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.costBadge}>
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <Circle
                        cx={12}
                        cy={12}
                        r={9}
                        stroke="#CC92C2"
                        strokeWidth={2.5}
                        fill="#CC92C2"
                        fillOpacity={0.35}
                      />
                      <Circle
                        cx={12}
                        cy={12}
                        r={4.5}
                        stroke="#CC92C2"
                        strokeWidth={2.5}
                      />
                    </Svg>
                    <Text style={styles.costBadgeText}>{item.cost} moedas</Text>
                  </View>
                </View>

                <Text style={styles.itemDescription}>{item.description}</Text>

                <View style={styles.itemFooterRow}>
                  <Text style={styles.availabilityText}>{item.availability}</Text>
                  <TouchableOpacity
                    style={styles.redeemButton}
                    activeOpacity={0.85}
                    onPress={() => handleRedeem(item)}
                  >
                    <Text style={styles.redeemButtonText}>Resgatar recompensa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={isProposeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProposeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsProposeModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Propor Nova Recompensa</Text>
              <TouchableOpacity
                onPress={() => setIsProposeModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Feather name="x" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>TÍTULO DO BENEFÍCIO</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ex: Não lavar louça no domingo"
                placeholderTextColor="rgba(132, 130, 143, 0.45)"
                value={propTitle}
                onChangeText={setPropTitle}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>CATEGORIA</Text>
              <View style={styles.modalCategoryRow}>
                {(['Folga', 'Convivência', 'Bônus'] as const).map((cat) => {
                  const isSel = propCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.modalCatBtn, isSel && styles.modalCatBtnActive]}
                      onPress={() => setPropCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.modalCatBtnText,
                          isSel && styles.modalCatBtnTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>CUSTO EM MOEDAS</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ex: 150"
                placeholderTextColor="rgba(132, 130, 143, 0.45)"
                keyboardType="numeric"
                value={propCost}
                onChangeText={setPropCost}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>DESCRIÇÃO DAS REGRAS</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalTextArea]}
                placeholder="Como funciona a folga ou benefício?"
                placeholderTextColor="rgba(132, 130, 143, 0.45)"
                multiline
                numberOfLines={2}
                value={propDescription}
                onChangeText={setPropDescription}
              />
            </View>

            <TouchableOpacity
              style={styles.modalSubmitButton}
              activeOpacity={0.88}
              onPress={handleCreateProposal}
            >
              <Text style={styles.modalSubmitButtonText}>Enviar proposta para votação</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const ShopScreen = StoreScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  topGlowSvg: {
    position: 'absolute',
    top: -100,
    right: -80,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 14 : 52,
    paddingBottom: 8,
    zIndex: 10,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  proposeButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  proposeButtonText: {
    color: '#FCFCFC',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 12,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(252, 252, 252, 0.8)',
  },
  balanceWeekBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  balanceWeekText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  balanceMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  coinIconBoxLarge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceNumber: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  balanceCoinsText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(252, 252, 252, 0.85)',
  },
  balanceHintText: {
    fontSize: 11,
    color: 'rgba(252, 252, 252, 0.8)',
    marginTop: 6,
    lineHeight: 15,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FCFCFC',
    fontWeight: '700',
  },
  itemsListContainer: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.22)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBoxPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxLilac: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(204, 146, 194, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxGray: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleCol: {
    flex: 1,
    gap: 2,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  categoryBadgeFolga: {
    backgroundColor: 'rgba(94, 43, 151, 0.10)',
  },
  categoryBadgeConvivencia: {
    backgroundColor: 'rgba(204, 146, 194, 0.20)',
  },
  categoryBadgeBonus: {
    backgroundColor: '#F4F4F5',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  categoryBadgeTextFolga: {
    color: Colors.primary,
  },
  categoryBadgeTextConvivencia: {
    color: Colors.text,
  },
  categoryBadgeTextBonus: {
    color: Colors.textSecondary,
  },
  itemSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(204, 146, 194, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(204, 146, 194, 0.40)',
  },
  costBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.text,
  },
  itemDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 12,
  },
  itemFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  availabilityText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  redeemButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  redeemButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalInputGroup: {
    gap: 4,
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
  },
  modalTextArea: {
    minHeight: 48,
    textAlignVertical: 'top',
  },
  modalCategoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCatBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.30)',
    alignItems: 'center',
  },
  modalCatBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalCatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modalCatBtnTextActive: {
    color: Colors.white,
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  modalSubmitButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
