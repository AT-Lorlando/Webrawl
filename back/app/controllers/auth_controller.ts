import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { signupValidator, loginValidator } from '#validators/auth'

export default class AuthController {
  public async signup({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(signupValidator)
    const user = await User.create(payload)
    const token = await auth.use('api').createToken(user)
    return response.created({ user, token })
  }

  public async login({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)
    const token = await auth.use('api').createToken(user)
    return response.ok({ user, token })
  }

  public async logout({ auth, response }: HttpContext) {
    await auth.use('api').invalidateToken()
    return response.ok({ message: 'Logged out successfully' })
  }

  public async user({ auth, response }: HttpContext) {
    const user = await auth.authenticate()
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }
    return response.ok(user)
  }
}
