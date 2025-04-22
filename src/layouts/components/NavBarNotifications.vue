<!-- eslint-disable camelcase -->
<script setup>
import { useWebSocket } from '@core/composable/useWebSocket'

const notifications = ref([])

const handleNewNotification = data => {
  notifications.value.unshift(data.notification)
}

const { messages } = useWebSocket(handleNewNotification)

// const notifications = ref([
//   {
//     id: 1,
//     img: avatar4,
//     title: 'Congratulation Flora! 🎉',
//     subtitle: 'Won the monthly best seller badge',
//     time: 'Today',
//     is_seen: true,
//   },
//   {
//     id: 2,
//     text: 'Tom Holland',
//     title: 'New user registered.',
//     subtitle: '5 hours ago',
//     time: 'Yesterday',
//     is_seen: false,
//   },
//   {
//     id: 3,
//     img: avatar5,
//     title: 'New message received 👋🏻',
//     subtitle: 'You have 10 unread messages',
//     time: '11 Aug',
//     is_seen: true,
//   },
//   {
//     id: 4,
//     img: paypal,
//     title: 'PayPal',
//     subtitle: 'Received Payment',
//     time: '25 May',
//     is_seen: false,
//     color: 'error',
//   },
//   {
//     id: 5,
//     img: avatar3,
//     title: 'Received Order 📦',
//     subtitle: 'New order received from john',
//     time: '19 Mar',
//     is_seen: true,
//   },
// ])

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
