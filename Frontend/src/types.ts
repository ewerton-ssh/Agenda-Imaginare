export type ServiceType =
  | 'Adesivo'
  | 'Automativo'
  | 'Fachada de ACM'
  | 'Letra caixa/acrilico'
  | 'Lona c/ Ilhos'
  | 'Painel de lona'
  | 'Outro'

export type FilterType = ServiceType | 'Todos'

export type ViewMode = 'week' | 'month'

export interface User {
  _id: string
  name: string
  email: string
  password?: string
  tokenVersion?: number
  admin: boolean
}

export type ServiceCollaborator = User | string

export interface Service {
  _id: string
  c: string
  t: ServiceType
  d: string
  collaborator: ServiceCollaborator
  start: string
  end: string
  done: boolean
  image?: string | null
}

export interface ServicePayload {
  c: string
  t: ServiceType
  d: string
  collaborator: string
  start: string
  end: string
  img?: File | string | null
}

export type UpdateServicePayload = Partial<ServicePayload>

export interface ServiceForm extends ServicePayload {
  id: string | null
  done: boolean
}

export type UpdateUserPayload = Partial<
  Pick<User, 'name' | 'email' | 'password' | 'admin'>
>

export interface UserResponse {
  users: User[]
  currentPage: number
  totalPages: number
  total: number
}

export interface WeatherDay {
  date: string
  weekday: string
  tempMax: number
  tempMin: number
  weatherCode: number
  precipitation: number
  description: string
}