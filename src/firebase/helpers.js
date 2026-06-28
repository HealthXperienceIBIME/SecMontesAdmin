// src/firebase/helpers.js
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, query, orderBy, Timestamp
} from 'firebase/firestore'
import { db } from './config'

// ── Presentaciones y Grupos ───────────────────────────────────────────────────

export const PRESENTACIONES = [
  {
    id: 'P1',
    label: 'Presentación 1',
    fecha: 'Miérc. 01 julio',
    grupos: ['1o Aqua', '2o Aqua', '3o Aqua']
  },
  {
    id: 'P2',
    label: 'Presentación 2',
    fecha: 'Miérc. 01 julio',
    grupos: ['1o Black', '2o Black', '3o Black']
  },
  {
    id: 'P3',
    label: 'Presentación 3',
    fecha: 'Miérc. 01 julio',
    grupos: ['1o Blue', '2o Blue', '3o Blue']
  },
  {
    id: 'P4',
    label: 'Presentación 4',
    fecha: 'Miérc. 01 julio',
    grupos: ['1o Golden', '2o Golden', '3o Golden']
  },
  {
    id: 'P5',
    label: 'Presentación 5',
    fecha: 'Miérc. 01 julio',
    grupos: ['1o White', '2o White']
  },
  {
    id: 'P6',
    label: 'Presentación 6',
    fecha: 'Miérc. 01 julio',
    grupos: ['1o Orange', '2o Orange']
  },
  {
    id: 'P7',
    label: 'Presentación 7',
    fecha: 'Juev. 02 julio',
    grupos: ['1o Green', '2o Green', '3o Green']
  },
  {
    id: 'P8',
    label: 'Presentación 8',
    fecha: 'Juev. 02 julio',
    grupos: ['1o Silver', '2o Silver', '3o Silver']
  },
  {
    id: 'P9',
    label: 'Presentación 9',
    fecha: 'Juev. 02 julio',
    grupos: ['1o Red', '2o Red', '3o Red']
  },
  {
    id: 'P10',
    label: 'Presentación 10',
    fecha: 'Juev. 02 julio',
    grupos: ['1o Yellow', '2o Yellow', '3o Yellow']
  },
]

// Helper: dado un grupo, retorna su presentación
export function getPresentacionByGrupo(grupo) {
  return PRESENTACIONES.find(p => p.grupos.includes(grupo)) || null
}

// ── Participants ──────────────────────────────────────────────────────────────

export async function getParticipant(qrId) {
  const ref = doc(db, 'participants', qrId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createParticipant(qrId, data) {
  const pres = getPresentacionByGrupo(data.grupo)
  const ref = doc(db, 'participants', qrId)
  await setDoc(ref, {
    ...data,
    qrId,
    presentacion: pres?.id || '',
    presentacionLabel: pres?.label || '',
    createdAt: Timestamp.now(),
    status: 'active'
  })
}

export async function updateParticipant(qrId, data) {
  const ref = doc(db, 'participants', qrId)
  await updateDoc(ref, { ...data, updatedAt: Timestamp.now() })
}

export async function deleteParticipant(qrId) {
  await deleteDoc(doc(db, 'participants', qrId))
}

export async function getAllParticipants() {
  const snap = await getDocs(query(collection(db, 'participants'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── IMC ───────────────────────────────────────────────────────────────────────

export async function saveIMC(qrId, imcData) {
  await updateDoc(doc(db, 'participants', qrId), {
    imc: imcData.imc,
    grasa: imcData.grasa,
    musculo: imcData.musculo,
    imcStatus: imcData.status,
    imcTipo: imcData.tipo,
    imcDoneAt: Timestamp.now()
  })
}

// ── Pruebas ───────────────────────────────────────────────────────────────────

export async function savePruebas(qrId, pruebas) {
  await updateDoc(doc(db, 'participants', qrId), {
    pruebas,
    pruebasOmitidas: false,
    pruebasDoneAt: Timestamp.now()
  })
}

export async function omitirPruebas(qrId) {
  await updateDoc(doc(db, 'participants', qrId), {
    pruebasOmitidas: true,
    pruebas: null,
    pruebasDoneAt: Timestamp.now()
  })
}

// ── Recomendaciones IA ────────────────────────────────────────────────────────

export async function saveRecomendaciones(qrId, recomendaciones) {
  await updateDoc(doc(db, 'participants', qrId), {
    recomendaciones,
    recomendacionesDoneAt: Timestamp.now()
  })
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const all = await getAllParticipants()
  const registrados = all.length
  const completos = all.filter(p => (p.pruebas || p.pruebasOmitidas) && p.recomendaciones).length
  const enProceso = all.filter(p => p.imc && !p.pruebas && !p.pruebasOmitidas).length
  const imcValues = all.filter(p => p.imc > 0).map(p => p.imc)
  const promedioIMC = imcValues.length
    ? (imcValues.reduce((a, b) => a + b, 0) / imcValues.length).toFixed(2)
    : 0

  const byGroup = {}
  all.forEach(p => {
    const g = p.grupo || 'Sin grupo'
    byGroup[g] = (byGroup[g] || 0) + 1
  })

  return { registrados, completos, enProceso, promedioIMC, byGroup, recent: all.slice(0, 8) }
}

// ── Premiaciones ──────────────────────────────────────────────────────────────

export async function getPremiaciones(presentacionId = null) {
  const all = await getAllParticipants()
  let withPruebas = all.filter(p => p.pruebas && !p.pruebasOmitidas)

  if (presentacionId && presentacionId !== 'todas') {
    withPruebas = withPruebas.filter(p => p.presentacion === presentacionId)
  }

  const top3 = (arr, fn, asc = false) =>
    [...arr].sort((a, b) => asc
      ? (fn(a) || 0) - (fn(b) || 0)
      : (fn(b) || 0) - (fn(a) || 0)
    ).slice(0, 3)

  return {
    salto: top3(withPruebas, p => p.pruebas?.saltoCuerda),
    lanzamiento: top3(withPruebas, p => p.pruebas?.lanzamiento),
    carrera: top3(withPruebas, p => p.pruebas?.carrera, true),
    velocidad: top3(withPruebas, p => p.pruebas?.velocidad),
    aceleracion: top3(withPruebas, p => p.pruebas?.aceleracion),
    fuerza: top3(withPruebas, p => p.pruebas?.fuerza),
  }
}

// ── IMC tipo ──────────────────────────────────────────────────────────────────
export function getIMCTipo(imc) {
  if (!imc) return 'normal'
  if (imc < 18.5) return 'bajo-peso'
  if (imc <= 24.9) return 'normal'
  if (imc <= 29.9) return 'sobrepeso'
  return 'obesidad'
}
