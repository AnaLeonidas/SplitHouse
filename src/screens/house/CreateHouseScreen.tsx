import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface CreateHouseScreenProps {
  onBackPress?: () => void;
  onSubmit?: (houseData: {
    name: string;
    address: string;
    type: 'apartment' | 'house';
    residentsCount: string;
  }) => void;
}

export const CreateHouseScreen: React.FC<CreateHouseScreenProps> = ({
  onBackPress,
  onSubmit,
}) => {
  const [houseName, setHouseName] = useState('');
  const [address, setAddress] = useState('');
  const [houseType, setHouseType] = useState<'apartment' | 'house'>('apartment');
  const [residentsCount, setResidentsCount] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Svg height="260" width="260" style={styles.topGlowSvg} pointerEvents="none">
        <Defs>
          <RadialGradient id="createHouseTopGlow" cx="60%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#5E2B97" stopOpacity={0.12} />
            <Stop offset="50%" stopColor="#CC92C2" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#FCFCFC" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#createHouseTopGlow)" />
      </Svg>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={onBackPress}
          >
            <Feather name="chevron-left" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerContainer}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Cadastrar sua casa</Text>
              <Text style={styles.subtitle}>
                Preencha os dados do imóvel. Ao finalizar, geraremos um código exclusivo para os moradores entrarem.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome da casa ou apartamento</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="home"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Residência Osborn / Ap 602"
                    placeholderTextColor={Colors.textSecondary}
                    value={houseName}
                    onChangeText={setHouseName}
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Endereço</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="map-pin"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Rua, número e bairro"
                    placeholderTextColor={Colors.textSecondary}
                    value={address}
                    onChangeText={setAddress}
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de moradia</Text>
                <View style={styles.pillSelector}>
                  <TouchableOpacity
                    style={[
                      styles.pillButton,
                      houseType === 'apartment' && styles.pillButtonActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setHouseType('apartment')}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        houseType === 'apartment' && styles.pillTextActive,
                      ]}
                    >
                      Apartamento
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.pillButton,
                      houseType === 'house' && styles.pillButtonActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setHouseType('house')}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        houseType === 'house' && styles.pillTextActive,
                      ]}
                    >
                      Casa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quantidade de moradores (estimativa)</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="users"
                    size={18}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 4"
                    placeholderTextColor={Colors.textSecondary}
                    value={residentsCount}
                    onChangeText={setResidentsCount}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                activeOpacity={0.85}
                onPress={() =>
                  onSubmit &&
                  onSubmit({
                    name: houseName,
                    address,
                    type: houseType,
                    residentsCount,
                  })
                }
              >
                <Text style={styles.submitButtonText}>Avançar para regras</Text>
                <Feather name="arrow-right" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  topGlowSvg: {
    position: 'absolute',
    top: -40,
    right: -40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 16 : 28,
    paddingBottom: Platform.OS === 'android' ? 44 : 28,
  },
  topBar: {
    marginBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  formContainer: {
    width: '100%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    height: '100%',
  },
  pillSelector: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 2,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(132, 130, 143, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  pillTextActive: {
    color: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
