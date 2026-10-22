export const en = {
  meta: {
    title: "Abody",
    description: "Digital products and services from Abody.",
  },
  header: {
    logoAlt: "Abody",
    cart: "Cart",
    signIn: "Sign in",
    account: "Account",
    // No plural forms: Arabic has several, so both languages use "items: N".
    cartLabel: (count: number) => `Cart, items: ${count}`,
    nav: "Main navigation",
    categories: "Store categories",
    home: "Home",
    products: "Products",
    services: "Services",
    about: "About",
    contact: "Contact",
    // Distinct from the listing's "Search products" field and "Search"
    // button names, which listing pages show alongside the header.
    search: {
      label: "Search digital products",
      placeholder: "Search templates and guides",
      submit: "Find products",
    },
    trust: {
      download: "Instant download after payment",
      payment: "Encrypted checkout with all major cards",
      tracking: "Track every service from your account",
    },
  },
  announcement: {
    label: "Announcement",
  },
  footer: {
    blurb:
      "Digital products you can download today and services run by the Abody team.",
    rights: (year: number) => `© ${year} Abody. All rights reserved.`,
    securePayment: "Secure payment",
    acceptedCards: "Accepted payment methods",
    shop: "Shop",
    company: "Company",
    legal: "Legal",
    contactLabel: "Email us",
  },
  product: {
    typeLabels: {
      DIGITAL_PRODUCT: "Digital product",
      SERVICE: "Service",
    },
    addToCart: "Add to cart",
    adding: "Adding…",
    added: "Added to your cart.",
    alreadyInCart: "This service is already in your cart.",
    maxQuantity: "You already have the maximum quantity of this item in your cart.",
    viewCart: "View cart",
    securePayment: "Secure payment",
    about: {
      DIGITAL_PRODUCT: "About this product",
      SERVICE: "About this service",
    },
    included: "What's included",
    requirements: "What we need from you",
    afterPurchase: {
      title: "What happens after you buy",
      steps: {
        DIGITAL_PRODUCT: [
          { title: "Pay securely", body: "Check out as a guest or signed in." },
          {
            title: "Download right away",
            body: "The download appears on your order confirmation page.",
          },
          {
            title: "Keep it handy",
            body: "It stays under Downloads in your account, and a receipt arrives by email.",
          },
        ],
        SERVICE: [
          {
            title: "Send your brief",
            body: "Answer a short form about your business after payment.",
          },
          {
            title: "We get to work",
            body: "Your service moves to In progress and you get an email.",
          },
          {
            title: "Track and receive",
            body: "Follow updates in your account until it's complete.",
          },
        ],
      },
    },
    questions: {
      title: "Common questions",
      items: [
        {
          question: "How do I pay?",
          answer:
            "Payment is secure and handled at checkout. We never store your card details.",
        },
        {
          question: "Can I buy without an account?",
          answer:
            "Yes, you can check out as a guest. Sign in before you buy to keep your downloads and services in your account.",
        },
        {
          question: "What is the refund policy?",
          answer: "See our {link} for when a refund applies.",
        },
      ],
      returnLink: "Return Policy",
    },
    contact: {
      prompt: "Have a question first?",
      action: "Contact us",
    },
    related: "You might also like",
    viewAll: "View all",
    instantDownload: "Instant download",
    startsAfterOnboarding: "Starts after onboarding",
    keptInAccount: "Kept in your account",
    statusUpdates: "Status updates in your account",
    fromAccount: "From your account",
    purchase: "Purchase",
    price: "Price",
  },
  listing: {
    catalogType: "Catalog type",
    categories: "Categories",
    categoryEmpty: "Nothing in this category right now.",
    searchButton: "Search",
    sortBy: "Sort by",
    sort: {
      newest: "Newest",
      priceAsc: "Price: low to high",
      priceDesc: "Price: high to low",
    },
    searchEmpty: "No results for",
    clearSearch: "Clear search",
    showing: "Showing {from}–{to}",
    pagination: {
      label: "Pages",
      previous: "Previous",
      next: "Next",
      page: "Page {page}",
    },
    types: {
      DIGITAL_PRODUCT: {
        title: "Products",
        intro:
          "Templates, guides, and resources you can download as soon as your payment is confirmed.",
        tab: "Digital products",
        all: "All products",
        searchLabel: "Search products",
        empty: "No products yet. Check back soon.",
        count: {
          zero: "{count} products",
          one: "{count} product",
          two: "{count} products",
          few: "{count} products",
          many: "{count} products",
          other: "{count} products",
        },
      },
      SERVICE: {
        title: "Services",
        intro:
          "Services run by the Abody team, from ad campaigns to account management. Work starts once we have your details.",
        tab: "Services",
        all: "All services",
        searchLabel: "Search services",
        empty: "No services yet. Check back soon.",
        count: {
          zero: "{count} services",
          one: "{count} service",
          two: "{count} services",
          few: "{count} services",
          many: "{count} services",
          other: "{count} services",
        },
      },
    },
  },
  home: {
    hero: {
      eyebrow: "Digital products and services",
      title: "Marketing tools and done-for-you services",
      lead: "Download templates and guides the moment you pay, or hand your ads to the Abody team and follow the work from your account.",
      search: {
        label: "Find a digital product",
        placeholder: "What are you looking for?",
        submit: "Search",
      },
      browse: "Browse:",
    },
    categories: "Shop by category",
    viewAll: "View all",
    featured: {
      title: "Featured products",
      intro: "Ready to use the minute your payment clears.",
      tabs: {
        bestSellers: "Best sellers",
        new: "New",
        templates: "Templates",
      },
    },
    services: {
      intro: "Buy online, tell us what we need, and we get started.",
      promoEyebrow: "Done for you",
      promoTitle: "Hand it to the Abody team",
      points: [
        "A clear scope and a fixed price",
        "A short brief after checkout, then we get started",
        "Status updates in your account",
      ],
      promoAction: "See how services work",
    },
    // Labels the hero trust row, which shows the header.trust lines.
    why: "Why Abody",
    howItWorksEyebrow: "Simple steps",
    howItWorks: "How it works",
    howItWorksIntro:
      "From picking a product to seeing results in four steps, with no hassle.",
    steps: [
      {
        title: "Discover",
        body: "Browse products and services and pick what fits.",
        tag: "Templates, guides, services",
      },
      {
        title: "Purchase",
        body: "Pay securely in a few clicks.",
        tag: "Encrypted payment",
      },
      {
        title: "Receive",
        body: "Download your files or fill in the service brief.",
        tag: "Within seconds",
      },
      {
        title: "Manage",
        body: "Find orders, downloads, and services in your account.",
        tag: "Email updates",
      },
    ],
    cta: {
      title: "Ready to grow your business?",
      body: "Start with a template today, or let us run the campaign for you.",
      action: "Browse the store",
    },
  },
  cart: {
    title: "Your cart",
    breadcrumb: "Breadcrumb",
    home: "Home",
    itemCount: {
      zero: "{count} items",
      one: "{count} item",
      two: "{count} items",
      few: "{count} items",
      many: "{count} items",
      other: "{count} items",
    },
    emptyTitle: "Your cart is empty",
    emptyBody:
      "Add a product or a service and it will show up here, ready for checkout.",
    browseStore: "Browse the store",
    continueShopping: "Continue shopping",
    itemsRemoved: "Some items are no longer available and are not shown.",
    instantDownload: "Instant download",
    onboardingAfterPayment: "Onboarding form after payment",
    quantity: "Quantity",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    remove: "Remove",
    summary: "Order summary",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Continue to checkout",
    redirecting: "Redirecting to secure checkout…",
    checkoutCancelled: "Checkout cancelled. Your cart is saved.",
    secureNote: "You pay on a secure, encrypted page",
    checkoutErrors: {
      empty_cart:
        "The items in your cart are no longer available. Refresh the page to see your cart.",
      coupon_invalid: "Your discount code no longer applies. Remove it to continue.",
      unexpected: "Checkout could not start. Please try again.",
    },
    coupon: {
      label: "Discount code",
      apply: "Apply",
      applying: "Applying…",
      remove: "Remove",
      removing: "Removing…",
      discount: "Discount",
      appliedNote: (percent: number) => `${percent}% off eligible items`,
      notApplied: "Code not applied",
      errors: {
        invalid: "This code isn't valid.",
        expired: "This code has expired.",
        used_up: "This code has reached its limit.",
        not_eligible: "This code doesn't apply to the items in your cart.",
        below_minimum: "This code can't be used on an order this small.",
        empty_cart: "Add something to your cart before using a code.",
        rate_limited: "Too many tries. Wait a few minutes and try again.",
        unexpected: "Something went wrong. Please try again.",
      },
    },
    errors: {
      invalid_input: "Enter a quantity from 1 to 99.",
      unavailable: "This item is no longer available.",
      cart_full: "Your cart is full. Remove an item to add another.",
      unexpected: "Something went wrong. Please try again.",
    },
  },
  checkoutResult: {
    total: "Total paid",
    keepShopping: "Keep shopping",
    viewServices: "Browse services",
    backToCart: "Back to your cart",
    orderNumber: "Order",
    downloads: {
      title: "Your downloads",
      download: "Download",
      keepLink:
        "Keep the link to this page to download your files again later.",
      pending:
        "Your downloads will appear here in a moment. Refresh the page to check.",
    },
    services: {
      title: "Your services",
      intro: "Tell the Abody team what it needs to get started.",
    },
    paid: {
      title: "Payment received",
      body: "Thank you for your purchase. We are confirming your order now.",
      confirmedBody: "Thank you for your purchase. Your order is confirmed.",
    },
    processing: {
      title: "Your payment is processing",
      body: "We are still confirming your payment. This can take a little while for some payment methods.",
    },
    not_completed: {
      title: "Payment not completed",
      body: "You were not charged. Your cart is still saved, so you can try again.",
    },
  },
  auth: {
    breadcrumb: "Breadcrumb",
    home: "Home",
    tabs: "Account",
    signInTab: "Sign in",
    registerTab: "Create account",
    signInTitle: "Sign in",
    registerTitle: "Create account",
    signInHeading: "Welcome back",
    registerHeading: "Create your account",
    signInIntro: "Sign in to continue.",
    registerIntro: "It takes less than a minute.",
    artEyebrow: "Your Abody account",
    artTitle: "Everything you buy, in one place",
    artBody: "Sign in to download your files and follow your services.",
    artCards: {
      downloads: { title: "Your downloads", body: "Ready whenever you need them" },
      services: { title: "Your services", body: "Follow every step of the work" },
      protected: {
        title: "Protected files",
        body: "Only you can download your purchases",
      },
    },
    name: "Your name",
    email: "Email address",
    password: "Password",
    passwordHint: "At least 8 characters",
    confirm: "Confirm password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    submitSignIn: "Sign in",
    submitRegister: "Create account",
    signingIn: "Signing in…",
    registering: "Creating account…",
    toRegister: "New to Abody?",
    toRegisterLink: "Create an account",
    toSignIn: "Already have an account?",
    toSignInLink: "Sign in",
    // Forgot password (feature 28).
    forgotLink: "Forgot password?",
    forgotTitle: "Forgot password",
    forgotHeading: "Forgot your password?",
    forgotIntro: "Enter your account email and we'll send you a link to choose a new password.",
    submitForgot: "Send reset link",
    sendingForgot: "Sending…",
    forgotSent:
      "If an account exists for that email, we've sent a link to reset your password. Check your inbox and spam folder.",
    backToSignIn: "Back to sign in",
    resetTitle: "Reset password",
    resetHeading: "Choose a new password",
    resetIntro: "Saving it signs you out on every device.",
    newPassword: "New password",
    submitReset: "Save new password",
    resetting: "Saving…",
    invalidLinkHeading: "This link is invalid or has expired",
    invalidLinkBody: "Reset links work once and expire after 1 hour. Ask for a new one.",
    requestNewLink: "Send a new link",
    resetDone: "Password changed. Sign in with your new password.",
    errors: {
      invalid_fields: "Please fix the highlighted fields.",
      email_taken: "An account with this email already exists. Sign in instead.",
      invalid_credentials: "Email or password is incorrect.",
      invalid_token: "This link is invalid or has expired. Ask for a new one.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unexpected: "Something went wrong. Please try again.",
    },
    fieldErrors: {
      name_required: "Enter your name.",
      name_too_long: "Use 100 characters or fewer.",
      email_invalid: "Enter a valid email address, like you@example.com.",
      password_required: "Enter your password.",
      password_too_short: "Use at least 8 characters.",
      password_too_long: "Use 128 characters or fewer.",
      password_mismatch: "The passwords do not match.",
    },
  },
  account: {
    title: "Your account",
    home: "Home",
    breadcrumb: "Breadcrumb",
    breadcrumbCurrent: "Account",
    navLabel: "Account",
    nav: {
      overview: "Overview",
      orders: "Orders",
      downloads: "Downloads",
      services: "Services",
      profile: "Profile",
    },
    signOut: "Sign out",
    welcome: "Welcome back, {name}",
    intro: "Here is what is happening with your orders and services.",
    stats: {
      orders: "Orders",
      downloads: "Downloads",
      services: "Services",
    },
    recentOrders: "Recent orders",
    allOrders: "All orders",
    recentDownloads: "Your downloads",
    allDownloads: "All downloads",
    columns: {
      order: "Order",
      date: "Date",
      items: "Items",
      status: "Status",
      total: "Total",
    },
    itemSeparator: ", ",
    orderLabel: "Order",
    purchased: "Purchased {date}",
    download: "Download",
    browseProducts: "Browse products",
    browseServices: "Browse services",
    orders: {
      title: "Your orders",
      intro: "Every order you placed while signed in.",
      empty: "No orders yet.",
      quantity: "Qty {count}",
      each: "{price} each",
      // Followed by the code, as in "Discount (SPRING-10)".
      discount: "Discount",
    },
    downloads: {
      title: "Your downloads",
      intro: "Download the files you bought as often as you need.",
      empty: "No downloads yet.",
    },
    services: {
      title: "Your services",
      intro: "Services you bought from the Abody team.",
      empty: "No services yet.",
    },
    service: {
      title: "Service progress",
      back: "Back to your services",
      progress: "Progress",
      details: "Your details",
      lastUpdated: "Last updated {date}",
      noDetails: "You have not sent your details yet.",
      steps: {
        purchased: "Purchased",
        details: "Details received",
        started: "Work started",
        completed: "Completed",
        cancelled: "Cancelled",
      },
      stepState: {
        done: "Done",
        current: "Current step",
        upcoming: "Upcoming",
      },
      messages: {
        none: "Send your details so the Abody team can start.",
        NEW: "We received your details. The Abody team will start soon.",
        WAITING_FOR_INFORMATION:
          "The Abody team needs more information. Please update your details.",
        IN_PROGRESS: "The Abody team is working on your service.",
        COMPLETED: "Your service is complete.",
        CANCELLED:
          "This service was cancelled. Contact Abody if you have any questions.",
      },
    },
    serviceStatus: {
      none: "Details needed",
      NEW: "Details received",
      WAITING_FOR_INFORMATION: "Waiting for information",
      IN_PROGRESS: "In progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    },
    status: {
      PENDING: "Pending",
      PAID: "Paid",
      PROCESSING: "Processing",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      REFUNDED: "Refunded",
    },
  },
  settings: {
    title: "Account settings",
    heading: "Account settings",
    intro: "Update your details, your password, and where you are signed in.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    currentPassword: "Current password",
    profile: {
      heading: "Profile",
      name: "Your name",
      email: "Email address",
      currentPasswordHint: "Needed only when you change your email.",
      submit: "Save changes",
      pending: "Saving…",
      saved: "Your profile was updated.",
    },
    password: {
      heading: "Password",
      newPassword: "New password",
      newPasswordHint: "At least 8 characters",
      confirm: "Confirm new password",
      submit: "Change password",
      pending: "Changing…",
      saved: "Your password was changed. Your other devices were signed out.",
    },
    sessions: {
      heading: "Other devices",
      intro: "Sign out everywhere else you are signed in. You stay signed in here.",
      submit: "Sign out other devices",
      pending: "Signing out…",
      none: "You were not signed in on any other device.",
      ended: {
        zero: "Signed out of {count} other devices.",
        one: "Signed out of {count} other device.",
        two: "Signed out of {count} other devices.",
        few: "Signed out of {count} other devices.",
        many: "Signed out of {count} other devices.",
        other: "Signed out of {count} other devices.",
      },
    },
    signedOut: "Your session has ended.",
    signInAgain: "Sign in again",
    errors: {
      invalid_fields: "Please fix the highlighted fields.",
      email_taken: "Another account already uses this email.",
      rate_limited: "Too many attempts. Try again in a few minutes.",
      unexpected: "Something went wrong. Please try again.",
    },
    fieldErrors: {
      name_required: "Enter your name.",
      name_too_long: "Use 100 characters or fewer.",
      email_invalid: "Enter a valid email address, like you@example.com.",
      password_required: "Enter your password.",
      password_too_short: "Use at least 8 characters.",
      password_too_long: "Use 128 characters or fewer.",
      password_mismatch: "The passwords do not match.",
      current_password_required: "Enter your current password.",
      current_password_wrong: "Your current password is incorrect.",
    },
  },
  onboarding: {
    title: "Service details",
    heading: "Tell us about your business",
    intro: "The Abody team uses these details to start your service.",
    orderLabel: "Order",
    required: "Required",
    fields: {
      businessName: "Business name",
      website: "Website",
      adAccount: "Ad account details",
      campaignGoals: "Campaign goals",
      budget: "Monthly budget",
      notes: "Additional notes",
    },
    hints: {
      adAccount: "Your ad account ID or page name. Never enter a password.",
      budget: "For example, £1,000 per month.",
    },
    notProvided: "Not provided",
    submit: "Send details",
    update: "Save changes",
    pending: "Sending…",
    saved: "Thank you. We received your details.",
    locked:
      "The Abody team has started on this service, so these details can no longer be changed. Contact Abody if something needs to change.",
    signedOut: "Your session has ended.",
    signInAgain: "Sign in again",
    errors: {
      invalid_fields: "Please fix the highlighted fields.",
      not_found: "This service is no longer available. Refresh the page.",
      locked:
        "The Abody team has started on this service, so these details can no longer be changed.",
      unexpected: "Something went wrong. Please try again.",
    },
    fieldErrors: {
      business_name_required: "Enter your business name.",
      too_long: "Use {max} characters or fewer.",
    },
    state: {
      needed: "Details needed",
      received: "Details received",
      locked: "Details received",
    },
    add: "Add your details",
    edit: "Update your details",
  },
  // The branded wrapper shared by the customer emails.
  emailLayout: {
    questions: "Questions? Write to us at",
    digitalProduct: "Digital product",
    service: "Service",
  },
  // Customer order confirmation email (feature 19a). {number} is "#1001".
  orderEmail: {
    subject: "Your Abody order {number} is confirmed",
    preheader: "Payment received for order {number}.",
    orderLabel: "Order",
    heading: "Thank you for your order",
    intro: "We received your payment. Here is a summary of order {number}.",
    paymentReceived: "Payment received",
    quantity: "Qty",
    total: "Total paid",
    nextTitle: "What happens next",
    downloadsTitle: "Your files are ready",
    downloadsBody:
      "Download your files from your order page. Keep this email to find them again later.",
    servicesTitle: "Next step: tell us about your business",
    servicesBody:
      "Open your order page and send us your business details so we can start your service.",
    viewOrder: "View your order",
    footer: "You received this email because you placed an order at Abody.",
  },
  serviceEmail: {
    subject: "Update on your Abody service: {name}",
    heading: "Your service has an update",
    waitingHeading: "We need a few more details",
    cancelledHeading: "Your service was cancelled",
    intro: "Here is the latest on {name} from order {number}.",
    status: "New status",
    viewOrder: "View your order",
    footer: "You received this email because you bought a service at Abody.",
  },
  // Forgot-password email (feature 28).
  passwordResetEmail: {
    subject: "Reset your Abody password",
    preheader: "Use this link within 1 hour to choose a new password.",
    heading: "Reset your password",
    intro: "We received a request to reset the password for your Abody account.",
    button: "Choose a new password",
    expires: "This link works once and expires in 1 hour.",
    ignore: "If you didn't ask for this, you can ignore this email. Your password stays the same.",
    didntAsk: "Didn't ask for this?",
    ignoreBody: "You can ignore this email. Your password stays the same.",
    pasteLink: "Button not working? Paste this link into your browser:",
    footer:
      "You received this email because a password reset was requested for your Abody account.",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
    home: "Back to home",
  },
  // Information pages (feature 27). Each section has paragraphs, a bullet list,
  // or both. The legal text is a draft for the owner to review before launch.
  info: {
    about: {
      title: "About Abody",
      description:
        "Who we are and what Abody offers: digital products and services in English and Arabic.",
      intro:
        "Abody is an online store for downloadable digital products and hands-on services.",
      sections: [
        {
          heading: "What we offer",
          paragraphs: [
            "Digital products you can buy and download straight after payment.",
            "Services such as ads management and account management, carried out by the Abody team once you tell us about your business.",
          ],
        },
        {
          heading: "How it works",
          paragraphs: [
            "You pay securely by card at checkout. Your downloads appear on your order page and stay in your account, and you can follow every service you buy from your account.",
          ],
        },
        {
          heading: "In your language",
          paragraphs: [
            "The whole store, from browsing to checkout and your account, works in English and Arabic.",
          ],
        },
      ],
    },
    contact: {
      title: "Contact us",
      description:
        "How to reach the Abody team about orders, downloads, and services.",
      intro:
        "Have a question about an order, a download, or a service? Email us and the Abody team will get back to you.",
      emailLabel: "Email",
      unavailable:
        "Our contact email is not available yet. Please check back soon.",
      sections: [
        {
          heading: "Before you write",
          items: [
            "If your question is about an order, include your order number.",
            "Write from the email address you ordered with, so we can find your order.",
            "For a service, you can also follow its status from your account.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms and Conditions",
      description:
        "The terms for buying digital products and services from Abody.",
      intro:
        "These terms apply when you use the Abody store or buy from it. By placing an order, you agree to them.",
      sections: [
        {
          heading: "Orders and payment",
          paragraphs: [
            "Prices are shown on each product and service page and at checkout. Payment is taken at our secure checkout, and your order is confirmed once the payment is confirmed.",
            "Discount codes apply only to the items they are valid for and only while they are active.",
          ],
        },
        {
          heading: "Digital products",
          paragraphs: [
            "After payment, your download is available on your order page and under Downloads in your account. Downloads are available only for paid orders.",
          ],
        },
        {
          heading: "Services",
          paragraphs: [
            "A service starts after you send us the details we need through its onboarding form. You can follow its status from your account.",
          ],
        },
        {
          heading: "Your account",
          paragraphs: [
            "You are responsible for keeping your password safe. You can update your details, change your password, and sign out your other sessions from your account settings.",
          ],
        },
        {
          heading: "Refunds",
          paragraphs: [
            "Refund requests are handled under our Return Policy. A refunded order no longer gives access to its downloads.",
          ],
        },
        {
          heading: "Changes to these terms",
          paragraphs: [
            "We may update these terms. The version on this page applies to orders placed after it is published.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      description:
        "What information Abody collects, why, and who helps us process it.",
      intro:
        "This policy explains what information we collect when you use the Abody store and how we use it.",
      sections: [
        {
          heading: "What we collect",
          items: [
            "Your name and email address when you create an account. Passwords are stored only as a secure hash, never as plain text.",
            "Your email address and the details of each order, including what you bought and its payment status.",
            "The information you send in a service onboarding form, so we can carry out the service.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "To process your orders, deliver your downloads and services, send you emails about your orders, and keep your account secure.",
          ],
        },
        {
          heading: "Payments",
          paragraphs: [
            "Payments are handled by our secure payment provider. Abody never receives or stores your card details.",
          ],
        },
        {
          heading: "Email",
          paragraphs: [
            "Emails about your orders, downloads, and services are sent through our email provider, Resend.",
          ],
        },
        {
          heading: "Cookies",
          paragraphs: [
            "We use only the cookies the store needs to work. They remember:",
          ],
          items: [
            "Your language choice.",
            "Your cart.",
            "Your sign-in session, if you have an account.",
          ],
        },
        {
          heading: "Your choices",
          paragraphs: [
            "You can update your name and email address from your account settings. For any other question about your information, email us using the address on our contact page.",
          ],
        },
      ],
    },
    returns: {
      title: "Return Policy",
      description: "How refund requests for Abody orders are handled.",
      intro:
        "Our products are digital and our services are carried out for you, so we review each refund request individually.",
      sections: [
        {
          heading: "Requesting a refund",
          paragraphs: [
            "Email us using the address on our contact page. Include your order number and the reason for your request.",
          ],
        },
        {
          heading: "How requests are decided",
          paragraphs: [
            "There is no automatic right to a refund. We review each request and reply by email with our decision.",
          ],
        },
        {
          heading: "If a refund is approved",
          items: [
            "The full order amount is refunded to your original payment method.",
            "The order's downloads are no longer available.",
          ],
        },
      ],
    },
  },
};

export type Dictionary = typeof en;
