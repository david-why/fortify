import type { H3Event } from 'h3'

export default defineEventHandler(async (event) => {
  const { csrfToken } = await getCsrfTokens(
    event,
    'https://siege.hackclub.com/market'
  )

  const [shopData, techTreeData, { purchases }, mercData, ttMercData, coins] =
    await Promise.all([
      getShopData(),
      getTechTreeData(event, csrfToken),
      getUserPurchases(event, csrfToken),
      getMercenaryData(event, csrfToken),
      getTravellingMercData(event, csrfToken),
      getUserCoins(event, csrfToken),
    ])

  const getPurchasedCount = (name: string) =>
    purchases.find((p) => p.item_name === name)?.quantity ?? 0

  const shopItems: ShopItem[] = []
  shopItems.push({
    id: 1,
    name: 'Mercenary',
    description:
      'This meeple will fight for you for an hour. Purchase to skip a required hour of sieging!',
    cost: mercData.price,
    kind: 'special',
    stock: 10,
    purchased: mercData.count,
  })
  shopItems.push({
    id: 2,
    name: 'Time travelling mercenary',
    description:
      "This mercenary will go back in time to fight your past battles. It will help get you back in the siege if you failed previously. Contact @Olive after buying to have its effects applied. NOTE: buying time travelling mercenaries may cause you to lose coins and/or have shop items forcably refunded! Make sure you're aware of the dangers of time travel...",
    cost: 40,
    kind: 'special',
    stock: ttMercData.quantity,
    purchased: ttMercData.inventory_count,
  })
  shopItems.push({
    id: 3,
    name: 'Unlock Orange Meeple',
    description: 'Not feeling your color? Try orange!',
    cost: 50,
    kind: 'special',
    stock: 1,
    purchased: getPurchasedCount('Unlock Orange Meeple'),
  })
  shopItems.push(
    ...shopData.cosmetics.map((item) => ({
      ...item,
      id: 100 + item.id,
      kind: 'cosmetics' as const,
      stock: 1,
      purchased: getPurchasedCount(item.name),
    }))
  )
  shopItems.push(
    ...shopData.physical_items.map((item) => ({
      ...item,
      id: 200 + item.id,
      kind: 'physical' as const,
      purchased: getPurchasedCount(item.name),
    }))
  )

  return {
    items: shopItems,
    coins,
    // tech_tree: techTreeData,
  }
})

async function getShopData(): Promise<APIShopData> {
  return await fetch('https://siege.hackclub.com/api/public-beta/shop').then(
    (r) => r.json()
  )
}

async function getTechTreeData(
  event: H3Event,
  csrfToken: string
): Promise<SiegeTechTree> {
  return await fetch('https://siege.hackclub.com/market/tech_tree_data', {
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      'x-csrf-token': csrfToken,
    },
  }).then((r) => r.json())
}

async function getUserPurchases(event: H3Event, csrfToken: string) {
  const data: SiegeUserPurchases = await fetch(
    'https://siege.hackclub.com/market/user_purchases',
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'x-csrf-token': csrfToken,
      },
    }
  ).then((r) => r.json())

  return data
}

async function getMercenaryData(event: H3Event, csrfToken: string) {
  const data: SiegeMercenaryData = await fetch(
    'https://siege.hackclub.com/market/mercenary_price',
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'x-csrf-token': csrfToken,
      },
    }
  ).then((r) => r.json())

  return data
}

async function getTravellingMercData(event: H3Event, csrfToken: string) {
  const data: SiegeTravelMercData = await fetch(
    'https://siege.hackclub.com/market/time_travelling_mercenary_data',
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'x-csrf-token': csrfToken,
      },
    }
  ).then((r) => r.json())

  return data
}

async function getUserCoins(event: H3Event, csrfToken: string) {
  const data: { coins: number } = await fetch(
    'https://siege.hackclub.com/market/user_coins',
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'x-csrf-token': csrfToken,
      },
    }
  ).then((r) => r.json())

  return data.coins
}
