<!-- eslint-disable camelcase -->
<script setup>
import { useWebSocket } from '@core/composable/useWebSocket'

const notifications = ref([])

const handleNewNotification = data => {
  notifications.value.unshift(data.notification)
}

const { messages } = useWebSocket(handleNewNotification)

const removeNotification = notificationId => {
  notifications.value.forEach((item, index) => {
    if (notificationId === item.id)
      notifications.value.splice(index, 1)
  })
}

const markRead = notificationId => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.is_seen = true
    })
  })
}

const markUnRead = notificationId => {
  notifications.value.forEach(item => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.is_seen = false
    })
  })
}

const handleNotificationClick = notification => {
  if (!notification.is_seen)
    markRead([notification.id])
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
