import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organizationName, phone } = await request.json()

    // Валидация
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { message: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Проверка email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Неверный формат email' },
        { status: 400 }
      )
    }

    // Проверка пароля
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Здесь будет интеграция с основным API проекта
    const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000'
    
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        organizationName, 
        phone 
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Ошибка регистрации' },
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
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
