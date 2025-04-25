<!-- eslint-disable camelcase -->
<script setup>
import { useWebSocket } from '@core/composable/useWebSocket'

const notifications = ref(JSON.parse(localStorage.getItem('notifications')))

const handleNewNotification = data => {
  notifications.value.unshift(data.notification)
}

const { messages } = useWebSocket(handleNewNotification)

const removeNotification = notificationId => {
  notifications.value.forEach((item, index) => {
    if (notificationId === item._id)
      notifications.value.splice(index, 1)
  })
  
  updateNotifications(notificationId, false)
}

const markRead = notificationId => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item._id)
        item.is_seen = true
    })
  })

  updateNotifications(notificationId)
}

const markUnRead = notificationId => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item._id)
        item.is_seen = false
    })
  })  

  updateNotifications(notificationId, true, false)
}

const handleNotificationClick = notification => {
  if (!notification.is_seen)
    markRead([notification._id])
}

const updateNotifications = (nots, update=true, is_seen=true) => {
  if (update) {
    $api('api/notifications', { 
      method: 'PATCH',
      body: {
        notifications: nots,
        is_seen: is_seen,
      },
    })
  } else {
    $api(`api/notifications`, { 
      method: 'DELETE',
      body: {
        notification: nots,
      },
    })
  }

  localStorage.setItem(
    'notifications', 
    JSON.stringify(notifications.value.map(item => ({ ...item }))))
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
