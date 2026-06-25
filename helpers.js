// src/firebase/helpers.js
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  deleteDoc, query, where, orderBy, limit, Timestamp
} from 'firebase/firestore'
import { db } from './config'

// ── Participants ──────────────────────────────────────────────────────────────

export async function getParticipant(qrId) {
  const ref = doc(db, 'participants', qrId)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function createParticipant(qrId, data) {
  const ref = doc(db, 'participants', qrId)
  await setDoc(ref, {
    ...data,
    qrId,
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
    imcDoneAt: Timestamp.now()
  })
}

// ── Pruebas ───────────────────────────────────────────────────────────────────

export async function savePruebas(qrId, pruebas) {
  await updateDoc(doc(db, 'participants', qrId), {
    pruebas,
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

// ── Stats for Dashboard ───────────────────────────────────────────────────────

export async function getDashboardStats() {
  const all = await getAllParticipants()
  const registrados = all.length
  const completos = all.filter(p => p.pruebas && p.recomendaciones).length
  const enProceso = all.filter(p => p.imc && !p.pruebas).length
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

export async function getPremiaciones(grupo = null) {
  const all = await getAllParticipants()
  const withPruebas = all.filter(p => p.pruebas)

  const sort = (arr, key, asc = false) =>
    [...arr].sort((a, b) => asc ? a - b : b - a)
      .map((p, i) => ({ ...p, pos: i + 1 }))

  const salto = [...withPruebas].sort((a, b) => (b.pruebas?.saltoCuerda || 0) - (a.pruebas?.saltoCuerda || 0)).slice(0, 3)
  const lanzamiento = [...withPruebas].sort((a, b) => (b.pruebas?.lanzamiento || 0) - (a.pruebas?.lanzamiento || 0)).slice(0, 3)
  const carrera = [...withPruebas].sort((a, b) => (a.pruebas?.carrera || 999) - (b.pruebas?.carrera || 999)).slice(0, 3)
  const velocidad = [...withPruebas].sort((a, b) => (b.pruebas?.velocidad || 0) - (a.pruebas?.velocidad || 0)).slice(0, 3)
  const aceleracion = [...withPruebas].sort((a, b) => (b.pruebas?.aceleracion || 0) - (a.pruebas?.aceleracion || 0)).slice(0, 3)
  const fuerza = [...withPruebas].sort((a, b) => (b.pruebas?.fuerza || 0) - (a.pruebas?.fuerza || 0)).slice(0, 3)

  return { salto, lanzamiento, carrera, velocidad, aceleracion, fuerza }
}

// ── GRUPOS disponibles ────────────────────────────────────────────────────────
export const GRUPOS = [
  '1o RED', '1o BLUE', '1o GREEN', '1o YELLOW', '1o BLACK', '1o WHITE', '1o SILVER', '1o AQUA',
  '2o RED', '2o BLUE', '2o GREEN', '2o YELLOW', '2o BLACK', '2o WHITE', '2o SILVER', '2o AQUA',
  '3o RED', '3o BLUE', '3o GREEN', '3o YELLOW', '3o BLACK', '3o WHITE', '3o SILVER', '3o AQUA',
]
