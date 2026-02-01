/**
 * 🔥 BOTA LOVE APP - Firebase Index
 * 
 * Exporta todos os serviços e tipos do Firebase
 * para facilitar importação em outros módulos
 * 
 * @author Bota Love Team
 */

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

export {
    app,
    auth,
    firestore, functions, getFirebaseConfig,
    getFunctionsRegion, isFirebaseConfigured, storage
} from './config';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export * from './types';

// =============================================================================
// 🔐 AUTENTICAÇÃO
// =============================================================================

export {
    changePassword, getCurrentAuthUser,
    getCurrentUserId, loginUser,
    logoutUser, onAuthStateChange, registerUser, resendVerificationCode, resetPassword, verifyEmailCode
} from './authService';

export type {
    AuthError, LoginResult, RegisterData
} from './authService';

// =============================================================================
// 👤 FIRESTORE / USUÁRIOS
// =============================================================================

export {
    addFcmToken, discoverNetworkProfiles, discoverProfiles, getUserById, incrementUserStat, recordProfileView, removeFcmToken, subscribeToUserProfile, updateDiscoverySettings,
    updateNotificationSettings, updateUserPhotos, updateUserProfile
} from './firestoreService';

export type {
    DiscoveryFilter
} from './firestoreService';

// =============================================================================
// 💕 MATCH
// =============================================================================

export {
    acceptCorreioDaRoca,
    countPendingCorreios,
    generateMatchId,
    getLike,
    getMatch,
    getOtherUserId,
    getPendingCorreios,
    getReceivedLikes,
    getSentCorreios,
    getUserMatches,
    likeUser,
    markLikeAsSeen,
    passUser,
    rejectCorreioDaRoca,
    sendCorreioDaRoca,
    subscribeToMatches,
    subscribeToPendingCorreios,
    unmatch
} from './matchService';

export type {
    CorreioResult,
    CorreioWithUser,
    LikeResult,
    MatchWithUser
} from './matchService';

// =============================================================================
// 🔍 DESCOBERTA DE USUÁRIOS
// =============================================================================

export {
    calculateAge,
    calculateDistance,
    discoverUsers,
    getDiscoveryFeed,
    getDiscoveryUserById,
    getInteractedUserIds,
    getReceivedLikesMap
} from './discoveryService';

export type {
    DiscoveryFilters,
    DiscoveryUser
} from './discoveryService';

// =============================================================================
// 💬 CHAT
// =============================================================================

export {
    blockChat,
    checkChatInactivity,
    createNetworkChat,
    getChatBetweenUsers,
    getChatById,
    getChatMessages,
    getOtherParticipant,
    getUnreadCount,
    getUserChats,
    markMessagesAsRead,
    sendMessage,
    subscribeToMessages,
    subscribeToUserChats,
    unblockChat
} from './chatService';

export type {
    ChatWithDetails,
    SendMessageResult
} from './chatService';

// =============================================================================
// 💳 ASSINATURAS E PAGAMENTOS
// =============================================================================

export {
    NETWORK_PLANS, PREMIUM_PLANS, TRIAL_DURATION_DAYS, activateNetworkTrial, activatePremiumTrial, cancelPremiumSubscription, getTrialDaysRemaining,
    getUserPayments, isNetworkActive, isPremiumActive, subscribeToNetwork, subscribeToPremium
} from './subscriptionService';

export type {
    PlanDetails
} from './subscriptionService';

// =============================================================================
// 🔔 NOTIFICAÇÕES
// =============================================================================

export {
    NOTIFICATION_TEMPLATES, createNotification, deleteNotification, getUnreadNotificationCount, getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead, subscribeToNotifications,
    subscribeToUnreadCount
} from './notificationService';

export type {
    NotificationPayload
} from './notificationService';

// =============================================================================
// 📁 STORAGE
// =============================================================================

export {
    STORAGE_PATHS, deleteAllProfilePhotos, deleteFile, generateFileName, getFileUrl, isValidFileSize, isValidImageType, listFiles, uploadChatImage,
    uploadEventImage,
    uploadImageWithProgress, uploadProfilePhoto
} from './storageService';

export type {
    UploadProgress, UploadResult
} from './storageService';

// =============================================================================
// 🌾 NETWORK RURAL
// =============================================================================

export {
    createConnection,
    getConnectionBetweenUsers, getNetworkProfiles, getUserConnections,
    removeConnection, removeLinkedInIntegration, subscribeToConnections, updateLinkedInProfile, updateNetworkSettings
} from './networkRuralFirebaseService';

export type {
    ConnectionRequest, NetworkProfile
} from './networkRuralFirebaseService';

// =============================================================================
// 🔑 LOGIN CHECK
// =============================================================================

export {
    getHighPriorityNotifications,
    getInactiveChatNotifications,
    hasImportantNotifications,
    performLoginCheck
} from './loginCheckService';

export type {
    LoginCheckResult,
    LoginNotification
} from './loginCheckService';

// =============================================================================
// 💳 STRIPE - PAGAMENTOS PIX
// =============================================================================

export {
    cancelPayment,
    checkoutNetwork,
    checkoutPremium,
    checkoutStoreItem,
    createPixPayment,
    formatPrice,
    getPaymentHistory,
    getPaymentStatus,
    isPaymentExpired,
    isPaymentPending
} from './stripeService';

export type {
    PaymentHistoryResponse,
    PaymentStatus,
    PixCheckoutRequest,
    PixCheckoutResponse,
    ProductCategory,
    ProductData
} from './stripeService';

// =============================================================================
// � LOJA - ITENS AVULSOS
// =============================================================================

export {
    MOCK_STORE_ITEMS, calculateSavings,
    formatPrice as formatStorePrice,
    getActiveStoreItems,
    getItemColor,
    getItemIcon,
    getStoreItemById,
    getStoreItemsByType,
    incrementItemSales,
    itemTypeColors,
    itemTypeIcons,
    itemTypeLabels
} from './storeItemsService';

export type {
    ItemStatus,
    ItemType,
    PricePackage,
    PricePackageWithSavings,
    StoreItem
} from './storeItemsService';

// =============================================================================
// 📋 PLANOS PREMIUM
// =============================================================================

export {
    MOCK_PLANS,
    formatPlanPrice,
    getPlansByCategory,
    getRenewalLabel
} from './plansService';

export type {
    IncludedItem,
    Plan,
    PlanCategory,
    PlanLimits,
    PlanPrices,
    RenewalType
} from './plansService';

// =============================================================================
// � ASSINATURAS DE PLANOS
// =============================================================================

export {
    PERIOD_DAYS,
    PERIOD_LABELS, addItemsToInventory,
    calculateEndDate,
    cancelSubscription,
    checkAndUpdateExpiredSubscriptions,
    formatPrice as formatSubscriptionPrice,
    getActiveSubscription,
    getDaysRemaining,
    getItemQuantity, getSubscriptionHistory, getPaymentHistory as getSubscriptionPaymentHistory, getUserInventory,
    hasInventoryItem,
    isSubscriptionActive, subscribeToPlan,
    useInventoryItem,
    useInventoryItemByName
} from './planSubscriptionService';

export type {
    PaymentRecord,
    SubscriptionPeriod,
    SubscriptionResult,
    UserInventory,
    UserInventoryItem,
    UserPlanSubscription,
    UserSubscriptionStatus
} from './planSubscriptionService';

// =============================================================================
// �💼 LINKEDIN
// =============================================================================

export {
    extractLinkedInUsername, fetchLinkedInProfessionalData, fetchLinkedInProfile, handleLinkedInCallback,
    isLinkedInTokenValid,
    isValidLinkedInUrl,
    removeLinkedInFromProfile,
    saveLinkedInToProfile,
    startLinkedInAuth
} from './linkedinService';

export type {
    LinkedInAuthResult,
    LinkedInCertification,
    LinkedInEducation,
    LinkedInPosition,
    LinkedInProfileData
} from './linkedinService';

