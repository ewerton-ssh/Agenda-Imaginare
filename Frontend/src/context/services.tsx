import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../services/api'
import type { Service, ServiceType, ServicePayload, UpdateServicePayload } from '../types'

function normalizeService(service: any): Service {
    const collaborator = service?.collaborator

    return {
        _id: service?._id ?? '',
        c: service?.client ?? service?.c ?? '',
        t: (service?.type ?? service?.t ?? 'Adesivo') as ServiceType,
        d: service?.description ?? service?.d ?? '',
        collaborator:
            typeof collaborator === 'string'
                ? collaborator
                : collaborator && typeof collaborator === 'object'
                    ? {
                        _id: collaborator._id ?? '',
                        name: collaborator.name ?? '',
                        email: collaborator.email ?? '',
                        admin: Boolean(collaborator.admin),
                    }
                    : '',
        start: service?.start ?? '',
        end: service?.end ?? '',
        done: Boolean(service?.done),
        image: service?.image ?? service?.img ?? null,
    }
}

type ServicesProviderProps = {
    children: ReactNode
}

type ServicesContextType = {
    services: Service[]
    getServices: () => Promise<void>
    createService: (data: ServicePayload) => Promise<Service | null>
    updateService: (id: string, data: UpdateServicePayload) => Promise<Service | null>
    deleteService: (id: string) => Promise<boolean>
    toggleDone: (id: string) => Promise<Service | null>
}

export const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

function ServicesProvider({ children }: ServicesProviderProps) {
    const [services, setServices] = useState<Service[]>([])

    async function getServices() {
        try {
            const response = await api.get('/api/v1/services')
            const normalizedServices = Array.isArray(response.data)
                ? response.data.map(normalizeService)
                : [normalizeService(response.data)]

            setServices(normalizedServices)
        } catch (error) {
            console.error('Erro ao buscar serviços:', error)
        }
    }

    useEffect(() => {
        getServices()
    }, [])

    async function createService(data: ServicePayload): Promise<Service | null> {
        try {
            const formData = new FormData()

            formData.append('client', data.c)
            formData.append('type', data.t)
            formData.append('description', data.d)
            formData.append('collaborator', data.collaborator)
            formData.append('start', data.start)
            formData.append('end', data.end)

            if (data.img) {
                formData.append('image', data.img)
            }

            const response = await api.post('/api/v1/services', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            const created = normalizeService(response.data)

            setServices(current => [...current, created])
            return created
        } catch (error) {
            console.error('Erro ao criar serviço:', error)
            return null
        }
    }

    async function updateService(id: string, data: UpdateServicePayload): Promise<Service | null> {
        try {
            const formData = new FormData();
            if (data.c !== undefined) formData.append('client', data.c);
            if (data.t !== undefined) formData.append('type', data.t);
            if (data.d !== undefined) formData.append('description', data.d);
            if (data.collaborator !== undefined) formData.append('collaborator', data.collaborator);
            if (data.start !== undefined) formData.append('start', data.start);
            if (data.end !== undefined) formData.append('end', data.end);

            if (data.img instanceof File) {
                formData.append('image', data.img);
            }

            const response = await api.put(`/api/v1/services/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updated = normalizeService(response.data);

            setServices(current =>
                current.map(service => (service._id === id ? updated : service))
            );

            return updated;
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            return null;
        }
    }

    async function deleteService(id: string): Promise<boolean> {
        try {
            await api.delete<{ message: string; id: string }>(`/api/v1/services/${id}`);
            setServices(current => current.filter(service => service._id !== id));
            return true;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Erro desconhecido ao excluir serviço';
            console.error('Erro ao excluir serviço:', errorMessage);

            return false;
        }
    }

    async function toggleDone(id: string): Promise<Service | null> {
        try {
            const response = await api.patch(`/api/v1/services/${id}/toggle-done`)
            const updated = normalizeService(response.data)
            setServices(current =>
                current.map(service => (service._id === id ? updated : service))
            )
            return updated
        } catch (error) {
            console.error('Erro ao alterar status:', error)
            return null
        }
    }

    return (
        <ServicesContext.Provider
            value={{
                services,
                getServices,
                createService,
                updateService,
                deleteService,
                toggleDone
            }}
        >
            {children}
        </ServicesContext.Provider>
    )
}

export default ServicesProvider

export function useServices() {
    const context = useContext(ServicesContext)

    if (!context) {
        throw new Error('useServices must be used within ServicesProvider')
    }

    return context
}