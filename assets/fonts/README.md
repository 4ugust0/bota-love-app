# 📝 Fontes do Sistema Tipográfico Premium

## ✅ Fontes Instaladas via Expo Google Fonts

O sistema tipográfico agora utiliza **@expo-google-fonts** para carregar as fontes automaticamente:

### Pacotes Instalados
- `@expo-google-fonts/playfair-display`
- `@expo-google-fonts/montserrat`

### Fontes Disponíveis

| Nome no App | Fonte Real | Pacote |
|-------------|-----------|--------|
| `PlayfairDisplay-Regular` | Playfair Display 400 | @expo-google-fonts/playfair-display |
| `PlayfairDisplay-Medium` | Playfair Display 500 | @expo-google-fonts/playfair-display |
| `PlayfairDisplay-Italic` | Playfair Display 400 Italic | @expo-google-fonts/playfair-display |
| `MontserratCondensed-SemiBold` | Montserrat 600 SemiBold* | @expo-google-fonts/montserrat |
| `Montserrat-ExtraBold` | Montserrat 800 ExtraBold | @expo-google-fonts/montserrat |

> *Nota: Montserrat Condensed não está disponível no Expo Google Fonts. Usamos Montserrat SemiBold como fallback.

---

## 🎯 Uso no código

```tsx
import { ThemedText } from '@/components/themed-text';

// Título principal (Playfair Display)
<ThemedText variant="title">Boa tarde, Roberta</ThemedText>

// Informação de perfil (Montserrat Condensed/SemiBold)
<ThemedText variant="profileInfo">IDADE 42 – FERNANDO</ThemedText>

// Interesse principal (Montserrat ExtraBold)
<ThemedText variant="interestPrimary">SHOWS</ThemedText>

// Interesse secundário (Playfair Italic)
<ThemedText variant="interestSecondary">academia · festas</ThemedText>
```

---

## 📦 Arquivos TTF Locais (Backup)

Os arquivos `.ttf` nesta pasta são mantidos como backup caso você precise usar fontes locais:

- `Montserrat-ExtraBold.ttf` ✅
- `MontserratCondensed-SemiBold.ttf` ✅

Para usar fontes locais ao invés do Expo Google Fonts, edite o arquivo `app/_layout.tsx`.

---

## 📜 Licença das Fontes

Todas as fontes utilizadas são de código aberto sob a licença **OFL (Open Font License)**, 
permitindo uso comercial e pessoal sem restrições.
