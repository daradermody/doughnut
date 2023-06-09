import { AllMiddlewareArgs, BlockAction, SlackActionMiddlewareArgs } from '@slack/bolt'
import renderHome from '../views/home'
import { userIds } from '../userIds'

export async function addUser({client, ack, body}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) {
  await ack()
  try {
    userIds.push(body.user.id)
    await renderHome(client, body.user.id)
  } catch (e) {
    console.error(e)
  }
}

export async function removeUser({client, ack, body}: SlackActionMiddlewareArgs<BlockAction> & AllMiddlewareArgs) {
  await ack()
  try {
    const index = userIds.findIndex(userId => userId === body.user.id)
    userIds.splice(index, 1)
    await renderHome(client, body.user.id)
  } catch (e) {
    console.error(e)
  }
}
