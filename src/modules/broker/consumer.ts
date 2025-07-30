export enum Consumer {
  NOTIFICATION_QUEUE = 'notification.events.queue',
  NOTIFICATION_EXCHANGE = 'notification.events.exchange',
  NOTIFICATION_USER_LOGIN_ROUTING_KEY = 'notification.events.user.login',

  USER_LOGIN_ROUTING_KEY = 'user.events.user.login',
  USER_LOGOUT_ROUTING_KEY = 'user.events.user.logout',
  USER_DISABLE_ROUTING_KEY = 'user.events.user.disabled',
  USER_PASSWORD_ROUTING_KEY = 'user.events.password.send',
  USER_OTP_SEND_ROUTING_KEY = 'user.events.otp.send',
  SHIPPER_USER_ACCEPT_ROUTING_KEY = 'user.events.shipper.accept',
  USER_TOKEN_REFRESH_ROUTING_KEY = 'user.events.user.forceRefreshToken',
  USER_INACTIVITY_ROUTING_KEY = 'user.events.user.inactivity',
  SHIPPER_CREATE_ROUTING_KEY = 'user.events.shipper.create',
  SUPPLIER_CREATE_ROUTING_KEY = 'user.events.supplier.create',
}
