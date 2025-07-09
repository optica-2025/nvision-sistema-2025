// netlify/functions/get-news.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const API_KEY = 'a004ca8cb8a14598a41d63adf36ffcbf';
    const category = event.queryStringParameters?.category || 'mundial';
    
    const queries = {
      mundial: 'internacional OR world OR global OR breaking news',
      local: 'República Dominicana OR Dominican Republic OR Santo Domingo',
      farandula: 'baseball OR béisbol OR entertainment OR farándula OR MLB'
    };

    const query = queries[category] || queries.mundial;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=6&language=es&apiKey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.articles && data.articles.length > 0) {
      const formattedNews = data.articles.map(article => ({
        texto: formatNewsTitle(article.title, category),
        enlace: article.url || '#',
        fecha: article.publishedAt
      }));
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          noticias: formattedNews,
          timestamp: new Date().toISOString()
        })
      };
    } else {
      const fallbackNews = getFallbackNews(category);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          noticias: fallbackNews,
          timestamp: new Date().toISOString(),
          fallback: true
        })
      };
    }
    
  } catch (error) {
    console.error('Error:', error);
    const fallbackNews = getFallbackNews(event.queryStringParameters?.category || 'mundial');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        noticias: fallbackNews,
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};

function formatNewsTitle(title, category) {
  const emojis = {
    mundial: ['🌍', '🇺🇸', '🇪🇺', '🇨🇳', '🌊', '🏛️', '💰', '🔥'],
    local: ['🇩🇴', '🏛️', '💰', '🏥', '🛣️', '⚡', '🌿', '🚁'],
    farandula: ['🎤', '⚾', '📱', '🎭', '💃', '🏆', '📺', '🎵']
  };
  
  const categoryEmojis = emojis[category] || ['📰'];
  const emoji = categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
  
  let cleanTitle = title.replace(/[^\w\s\-áéíóúñü]/gi, '').substring(0, 80);
  if (title.length > 80) cleanTitle += '...';
  
  return `${emoji} ${cleanTitle}`;
}

function getFallbackNews(category) {
  const fallback = {
    mundial: [
      {texto: "🌍 Actualizando noticias internacionales en tiempo real", enlace: "https://cnnespanol.cnn.com/mundo"},
      {texto: "🇺🇸 Últimas decisiones políticas de Estados Unidos", enlace: "https://cnnespanol.cnn.com/categoria/politica"},
      {texto: "💰 Mercados globales muestran volatilidad esta semana", enlace: "https://cnnespanol.cnn.com/economia"},
      {texto: "🌊 Crisis climática: nuevos estudios científicos", enlace: "https://news.un.org/es/news"},
      {texto: "🏛️ Tensiones diplomáticas en el escenario mundial", enlace: "https://cnnespanol.cnn.com/mundo"},
      {texto: "🔥 Situación de emergencia en múltiples regiones", enlace: "https://cnnespanol.cnn.com/mundo"}
    ],
    local: [
      {texto: "🇩🇴 Gobierno dominicano anuncia nuevas políticas", enlace: "https://listindiario.com/"},
      {texto: "💰 Economía dominicana muestra signos positivos", enlace: "https://hoy.com.do/"},
      {texto: "🏥 Mejoras en el sistema de salud nacional", enlace: "https://almomento.net/"},
      {texto: "🛣️ Infraestructura: nuevos proyectos en desarrollo", enlace: "https://listindiario.com/"},
      {texto: "⚡ Sector eléctrico registra avances importantes", enlace: "https://hoy.com.do/"},
      {texto: "🇭🇹 Situación fronteriza requiere atención continua", enlace: "https://almomento.net/"}
    ],
    farandula: [
      {texto: "⚾ Dominicanos brillan en las Grandes Ligas", enlace: "https://www.mlb.com/es/news"},
      {texto: "🎤 Artistas dominicanos conquistan mercado internacional", enlace: "https://www.univision.com/temas/farandula"},
      {texto: "📱 Influencers locales rompen récords en redes", enlace: "https://www.telemundo.com/entretenimiento/farandula"},
      {texto: "🎭 Producciones nacionales ganan reconocimiento", enlace: "https://cnnespanol.cnn.com/entretenimiento"},
      {texto: "💃 Merengue y bachata siguen conquistando el mundo", enlace: "https://www.univision.com/temas/farandula"},
      {texto: "🏆 Deportistas dominicanos destacan internacionalmente", enlace: "https://www.mlb.com/es/news"}
    ]
  };
  
  return fallback[category] || fallback.mundial;
}