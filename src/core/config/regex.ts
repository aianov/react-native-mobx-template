export const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
export const loginRegex = /^[a-zA-Z0-9]+$/
export const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d+\-!$%^&*()_]+$/
export const numberRegex = /^\+?[1-9]\d{6,15}$/