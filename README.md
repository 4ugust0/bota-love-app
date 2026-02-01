# Bota Love App 🌾❤️

Um aplicativo de rede social e namoro conectando pessoas do meio rural. Desenvolvido com [Expo](https://expo.dev) e [React Native](https://reactnative.dev).

## Como Iniciar Localmente

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Git

### Instalação e Configuração

1. **Clone o repositório**

   ```bash
   git clone <repository-url>
   cd bota-love-app
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   - Crie um arquivo `.env.local` na raiz do projeto
   - Configure as credenciais do Firebase (consulte [FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md))
   - Configure as credenciais do Stripe (consulte [STRIPE_LINKEDIN_SETUP.md](docs/STRIPE_LINKEDIN_SETUP.md))

4. **Inicie o servidor de desenvolvimento**

   ```bash
   npx expo start
   ```

### Opções de Execução

Após executar `npx expo start`, você terá as seguintes opções:

- **Expo Go**: Pressione `i` para iOS ou `a` para Android usando o app Expo Go em seu dispositivo
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/): Emulador do Android Studio
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/): Simulador do iOS
- [Development Build](https://docs.expo.dev/develop/development-builds/introduction/): Build de desenvolvimento customizado

### Estrutura do Projeto

- **app/**: Páginas e rotas da aplicação (usa file-based routing)
- **components/**: Componentes reutilizáveis
- **services/**: Serviços de integração (Firebase, API, etc.)
- **contexts/**: Context API para estado global
- **hooks/**: Custom hooks do React
- **constants/**: Temas, tipografia e constantes
- **assets/**: Fontes, imagens e outros recursos

### Desenvolvimento

Você pode começar a desenvolver editando os arquivos dentro do diretório **app**. Este projeto utiliza [file-based routing](https://docs.expo.dev/router/introduction).

## Documentação Adicional

- [Firebase Setup](docs/FIREBASE_SETUP.md): Configuração do Firebase
- [Stripe e LinkedIn Setup](docs/STRIPE_LINKEDIN_SETUP.md): Configuração de pagamentos e autenticação
- [Documentação Técnica](docs/DOCUMENTACAO_tecnica.md): Arquitetura e componentes principais
- [Sistema de Moderação](docs/MODERATION_SYSTEM.md): Sistema de moderação de conteúdo
- [Rede Rural](docs/NETWORK_RURAL.md): Documentação da rede rural

## Recursos de Aprendizado

Para aprender mais sobre desenvolvimento com Expo, consulte:

- [Documentação Expo](https://docs.expo.dev/): Fundamentos e tópicos avançados
- [Tutorial Expo](https://docs.expo.dev/tutorial/introduction/): Crie um projeto que roda em Android, iOS e web
- [React Native Docs](https://reactnative.dev/docs/getting-started): Documentação do React Native

## Comunidade

- [Expo no GitHub](https://github.com/expo/expo): Veja nossa plataforma open source
- [Comunidade Discord](https://chat.expo.dev): Chat com desenvolvedores Expo
