const BASE = process.env.NEXT_PUBLIC_JARMY_API_URL ?? "http://localhost:8000"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function del(path: string): Promise<void> {
  await fetch(`${BASE}${path}`, { method: "DELETE" })
}

export const adminApi = {
  quality:      () => get<any>("/admin/data-quality"),
  etlStatus:    () => get<any>("/etl/etl/status"),
  etlRun:       () => post<any>("/etl/etl/run", {}),
  approvals:    () => get<any>("/admin/approvals"),
  approve:      (table: string, id: number, valeur: number) =>
    post<any>(`/admin/approvals/${table}/${id}/approve?valeur=${valeur}`, {}),

  users:        (p = 0) => get<any>(`/admin/users?limit=50&offset=${p * 50}`),
  deleteUser:   (id: number) => del(`/admin/users/${id}`),
  updateUser:   (id: number, b: any) => patch<any>(`/admin/users/${id}`, b),

  foods:        (p = 0) => get<any>(`/admin/foods?limit=50&offset=${p * 50}`),
  deleteFood:   (id: number) => del(`/admin/foods/${id}`),

  exercises:    (p = 0) => get<any>(`/admin/exercises?limit=50&offset=${p * 50}`),
  deleteEx:     (id: number) => del(`/admin/exercises/${id}`),

  analyticsUsers:     () => get<any>("/admin/analytics/users"),
  analyticsNutrition: () => get<any>("/admin/analytics/nutrition"),
  analyticsFitness:   () => get<any>("/admin/analytics/fitness"),
  analyticsKpis:      () => get<any>("/admin/analytics/kpis"),

  exportUrl: (dataset: string, format: string) =>
    `${BASE}/admin/export/${dataset}?format=${format}`,
}
