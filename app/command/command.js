const commands = {
    addProfile: 'user-manager/profile/add name=prof12 price=0 starts-when=first-auth validity=unlimited',
    removeProfile: 'user-manager profile remove [find name="prof1"]',
    addLimitation: 'user-manager/limitation/add download-limit=2G upload-limit=2G name=12 rate-limit-tx=2M rate-limit-rx=2M uptime-limit=2d',
    assignLimitationToProfile: 'user-manager/profile-limitation/add profile=prof12 limitation=12 weekdays=saturday',
    removeLimitation: 'user-manager limitation/remove [find name="lim1"]',
    addUser: 'user-manager/user/add name=m password=65464 shared-users=5',
    assignUserToProfile: 'user-manager/user-profile/add user=m profile=prof12',
    activeUsers: 'user-manager session print without-paging where active=yes columns=user',
    userSessionInfo: 'user-manager session print where user="USERNAME" columns=user,start-time,uptime',
    disableUser: 'user-manager user set [find name="john_doe"] disabled=yes',
    enableUser: 'user-manager user set [find name="m"] disabled=no',
    removeUser: 'user-manager user remove [find name="USERNAME"]',
    testConnection: '/ip/address/print' // این دستور برای تست اتصال است
};

module.exports = commands;
