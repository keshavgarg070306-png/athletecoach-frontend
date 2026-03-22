import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8080/api'
})

export const login = (data) => API.post('/auth/login', data)
export const register = (data) => API.post('/auth/register', data)
export const getWeaknesses = (email) => API.get('/weaknesses', { headers: { 'X-User-Email': email }})
export const addWeakness = (email, data) => API.post('/weaknesses', data, { headers: { 'X-User-Email': email }})
export const deleteWeakness = (email, id) => API.delete(`/weaknesses/${id}`, { headers: { 'X-User-Email': email }})
export const generatePlan = (email) => API.post('/plans/generate', {}, { headers: { 'X-User-Email': email }})
export const getCurrentPlan = (email) => API.get('/plans/current', { headers: { 'X-User-Email': email }})
export const completeDrill = (email, id) => API.post(`/plans/drills/${id}/complete`, {}, { headers: { 'X-User-Email': email }})
export const getXp = (email) => API.get('/xp', { headers: { 'X-User-Email': email }})
export const getAchievements = (email) => API.get('/xp/achievements', { headers: { 'X-User-Email': email }})
export const getLeaderboard = () => API.get('/leaderboard/global')
export const getSportLeaderboard = (sport) => API.get(`/leaderboard/sport/${sport}`)
export const getFixtures = (email) => API.get('/fixtures', { headers: { 'X-User-Email': email }})
export const addFixture = (email, data) => API.post('/fixtures', data, { headers: { 'X-User-Email': email }})
export const deleteFixture = (email, id) => API.delete(`/fixtures/${id}`, { headers: { 'X-User-Email': email }})