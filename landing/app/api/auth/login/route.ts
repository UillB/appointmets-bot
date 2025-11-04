import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Здесь будет интеграция с основным API проекта
    // Пока что используем заглушку
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000'
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let errorMessage = 'Ошибка входа'
      try {
        const error = await response.json()
        // Backend возвращает { error: '...' } или { message: '...' }
        errorMessage = error.error || error.message || 'Ошибка входа'
      } catch (e) {
        // Если ответ не JSON, используем статус код
        if (response.status === 401) {
          errorMessage = 'Неверный email или пароль'
        } else if (response.status === 400) {
          errorMessage = 'Неверные данные'
        }
      }
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Создаем ответ с токеном
    const result = NextResponse.json({
      success: true,
      user: data.user,
      token: data.accessToken
    })

    // Устанавливаем HTTP-only cookie для токена
    result.cookies.set('token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    })

    return result

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
