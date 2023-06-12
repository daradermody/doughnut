import type { VercelRequest, VercelResponse } from '@vercel/node'
import validateSlackRequest from './_hiddenFunctions/validate'
import { addUser, removeUser } from './_hiddenFunctions/actions/manageUsers'
import renderHome from './_hiddenFunctions/views/home'
import assembleGroups from './_hiddenFunctions/actions/assembleGroups'

export default async function events(req: VercelRequest, res: VercelResponse) {
  // if (req.method === "GET" && 'assemble' in req.query) {
  //   await assembleGroups()
  //   return res.status(200).end()
  // }

  if (!await validateSlackRequest(req, process.env.SLACK_SIGNING_SECRET as string)) {
    return res.status(401).send('Unauthorised')
  }

  const payload = JSON.parse(req.body.payload)

  if (payload.type !== 'block_actions') {
    return res.status(400).send('Bad request')
  }

  const actionId = payload.actions[0].action_id
  if (actionId === 'remove_user') {
    await removeUser(payload.user.id)
    await renderHome(payload.user.id)
  } else if (actionId === 'add_user') {
    await addUser(payload.user.id)
    await renderHome(payload.user.id)
  } else if (actionId === 'assemble') {
    await assembleGroups()
  }
  return res.status(200).end()
}
