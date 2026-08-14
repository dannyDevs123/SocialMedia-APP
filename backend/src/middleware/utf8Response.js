const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';

/**
 * Ensures every JSON API response declares UTF-8 so browsers and clients
 * decode emojis and special characters correctly.
 */
const ensureUtf8JsonResponse = (_req, res, next) => {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = (body) => {
    res.setHeader('Content-Type', JSON_CONTENT_TYPE);
    return originalJson(body);
  };

  res.send = (body) => {
    if (body !== undefined && typeof body === 'object' && !Buffer.isBuffer(body)) {
      res.setHeader('Content-Type', JSON_CONTENT_TYPE);
    }
    return originalSend(body);
  };

  next();
};

module.exports = ensureUtf8JsonResponse;
