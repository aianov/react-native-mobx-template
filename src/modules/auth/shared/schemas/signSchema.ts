import { passwordRegex } from '@core/config/regex';
import { m } from '@lib/mobx-toolbox';

export const passwordSchema = m.schema({
	password: m.reset()
		.required({ message: "Введите пароль" })
		.minLength(6, { message: "Пароль слишком короткий" })
		.regex(passwordRegex, { message: 'Пароль имеет запрещенные символы' })
		.maxLength(32, { message: "Пароль слишком длинный" })
		.build()
});

export const signInSchema = m.schema({
	number: m.reset()
		.required({ message: "Введите номер телефона" })
		.minLength(3, { message: "Номер телефона слишком короткий" })
		.build(),
	password: m.reset()
		.required({ message: "Введите пароль" })
		.minLength(6, { message: "Пароль слишком короткий" })
		.regex(passwordRegex, { message: 'Пароль имеет запрещенные символы' })
		.maxLength(32, { message: "Пароль слишком длинный" })
		.build(),
});

export const signUpSchema = m.schema({
	name: m.reset()
		.required({ message: "Введите логин" })
		.minLength(3, { message: "Логин слишком короткий" })
		.maxLength(32, { message: "Логин слишком длинный" })
		.build(),
	number: m.reset()
		.required({ message: "Введите номер телефона" })
		.minLength(3, { message: "Номер телефона слишком короткий" })
		.build(),
	password: m.reset()
		.required({ message: "Введите пароль" })
		.minLength(6, { message: "Пароль слишком короткий" })
		.regex(passwordRegex, { message: 'Пароль имеет запрещенные символы' })
		.maxLength(32, { message: "Пароль слишком длинный" })
		.build(),
	repeatPassword: m.reset()
		.required({ message: "Введите пароль еще раз" })
		.minLength(6, { message: "Пароль слишком короткий" })
		.maxLength(32, { message: "Пароль слишком длинный" })
		.matchField('password', { message: "Пароли не совпадают" })
		.build()
});