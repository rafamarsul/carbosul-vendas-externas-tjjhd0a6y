import pb from '@/lib/pocketbase/client'

export interface CoverageArea {
  id: string
  user_id: string
  city: string
  state: string
  region: string
  active: boolean
  created: string
  updated: string
  expand?: { user_id?: { id: string; name: string; email: string } }
}

export interface CoverageAreaForm {
  user_id: string
  city: string
  state: string
  region: string
  active: boolean
}

export const STATE_OPTIONS = ['SC', 'RS'] as const
export const REGION_OPTIONS = [
  'Grande Florianópolis',
  'Vale do Itajaí',
  'Litoral Norte',
  'Sul',
  'Missões',
  'Planalto',
  'Capital',
  'Grande POA',
] as const

export const getCoverageAreas = () =>
  pb.collection('coverage_areas').getFullList({
    sort: '-created',
    expand: 'user_id',
  }) as Promise<CoverageArea[]>

export const getMyCoverageAreas = (userId: string) =>
  pb.collection('coverage_areas').getFullList({
    filter: `user_id = '${userId}'`,
    sort: '-created',
  }) as Promise<CoverageArea[]>

export const getActiveCoverageAreasByUser = (userId: string) =>
  pb.collection('coverage_areas').getFullList({
    filter: `user_id = '${userId}' && active = true`,
    sort: '-created',
  }) as Promise<CoverageArea[]>

export const bulkCreateCoverageAreas = async (
  userId: string,
  items: Array<{ city: string; state: string; region: string }>,
) => {
  const results = []
  for (const item of items) {
    try {
      const record = await pb.collection('coverage_areas').create({
        user_id: userId,
        city: item.city,
        state: item.state,
        region: item.region,
        active: true,
      })
      results.push(record)
    } catch (e) {
      console.error('Failed to create coverage area:', e)
    }
  }
  return results
}

export const createCoverageArea = (data: CoverageAreaForm) =>
  pb.collection('coverage_areas').create(data)

export const updateCoverageArea = (id: string, data: Partial<CoverageAreaForm>) =>
  pb.collection('coverage_areas').update(id, data)

export const deleteCoverageArea = (id: string) => pb.collection('coverage_areas').delete(id)
