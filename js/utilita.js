/** Funzioni condivise dal sito pubblico. Nessuna dipendenza esterna. */
window.UDCUtils = Object.freeze({
  async loadJson(filename, localKey) {
    const offlineCopy = window.UDCLocalData?.[localKey];
    if (window.location.protocol === 'file:') {
      if (offlineCopy !== undefined) return offlineCopy;
      throw new Error('Catalogo locale non presente: ' + filename);
    }
    try {
      const response = await fetch('data/' + filename, { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.json();
    } catch (error) {
      if (offlineCopy !== undefined) {
        console.warn('Uso la copia locale per ' + filename, error);
        return offlineCopy;
      }
      throw error;
    }
  },

  escapeHtml(value) {
    const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value ?? '').replace(/[&<>"']/g, char => chars[char]);
  },

  safeUrl(value, allowRelative = false) {
    try {
      const url = new URL(String(value || ''), window.location.href);
      if (url.protocol !== 'https:' && !(allowRelative && (url.protocol === 'http:' || (url.protocol === 'file:' && value && !String(value).startsWith('//'))))) return '';
      return url.href;
    } catch {
      return '';
    }
  },

  formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return String(value || '');
    return new Date(`${value}T12:00:00`).toLocaleDateString('it-IT', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  uniqueNews(items) {
    const seenTitles = new Set();
    const seenUrls = new Set();
    return items.filter(item => {
      const title = String(item.title || '').toLocaleLowerCase('it').replace(/[^a-z0-9à-ÿ]+/g, ' ').trim();
      const url = window.UDCUtils.safeUrl(item.href);
      if (!title || !url) return false;
      const key = url.split('?')[0].replace(/\/$/, '');
      if (seenTitles.has(title) || seenUrls.has(key)) return false;
      seenTitles.add(title);
      seenUrls.add(key);
      return true;
    });
  }
});
