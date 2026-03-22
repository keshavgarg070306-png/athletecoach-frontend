const GEMINI_KEY = 'AIzaSyCqIXCX3Gce7vbzvgpvCtEO43eVD15iqIA'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

const ask = async (prompt) => {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  })
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

export const aiChat = async (message, playerContext) => {
  const prompt = `You are an expert sports coach for ${playerContext.sport}.
Player: ${playerContext.name}, Level: ${playerContext.level}, Sport: ${playerContext.sport}
Weaknesses: ${playerContext.weaknesses}
Player asks: ${message}
Give a short, practical coaching response in 2-3 sentences.`
  return await ask(prompt)
}

export const aiDetectWeakness = async (description, sport) => {
  const prompt = `A ${sport} player says: "${description}"
Based on this, identify the most relevant weakness tag from this list:
WEAK_VS_SPIN, WEAK_VS_YORKER, WEAK_VS_PACE, POOR_RUNNING, POOR_CATCHING, POOR_FOOTWORK,
POOR_FINISHING, WEAK_LEFT_FOOT, POOR_HEADING, POOR_PASSING, POOR_DEFENDING, POOR_DRIBBLING,
WEAK_BACKHAND, POOR_SMASH, WEAK_NET_PLAY, LOW_STAMINA,
POOR_SERVE, WEAK_VOLLEY, POOR_BASELINE,
POOR_DRIBBLING_BASKETBALL, WEAK_FREE_THROW, POOR_DEFENSE, POOR_REBOUNDING
Reply with ONLY the tag name, nothing else.`
  return await ask(prompt)
}

export const aiAnalyzeMatch = async (matchDescription, playerContext) => {
  const prompt = `You are a sports coach analyzing a match performance.
Sport: ${playerContext.sport}, Player Level: ${playerContext.level}
Player's match report: "${matchDescription}"
Current weaknesses: ${playerContext.weaknesses}
Provide:
1. Performance analysis (2 sentences)
2. What to improve (2 sentences)
3. Recommended drills (1-2 drills)
Keep it concise and motivating.`
  return await ask(prompt)
}

export const aiPredictPerformance = async (playerContext) => {
  const prompt = `Analyze this athlete's progress and predict their performance:
Sport: ${playerContext.sport}
Current Level: ${playerContext.level} (${playerContext.levelTitle})
Total XP: ${playerContext.totalXp}
Current Streak: ${playerContext.streak} days
Weaknesses: ${playerContext.weaknesses}
Drills completed this week: ${playerContext.drillsDone}
Provide:
1. Performance prediction for next 2 weeks
2. Expected level up timeline
3. Top 2 areas to focus on
4. Motivational message
Keep response under 150 words.`
  return await ask(prompt)
}

export const aiTrainingAdvice = async (planDrills, playerContext) => {
  const prompt = `You are a personal sports trainer.
Sport: ${playerContext.sport}, Player: ${playerContext.name}
This week's training plan includes: ${planDrills}
Player weaknesses: ${playerContext.weaknesses}
Give 3 specific tips to maximize the effectiveness of this training plan.
Keep each tip under 2 sentences. Be specific and practical.`
  return await ask(prompt)
}