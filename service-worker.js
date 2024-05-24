let fetchCount = 0
const cacheName = 'site-static'

const assets = [
  '/',
  '/index.html',
  'manifest.webmanifest',
  '/second-page',
  '/second-page/index.html',
]

self.addEventListener('install', (/** @type {ExtendableEvent} */ event) => {
  console.log('Install event')
  // console.group('Install event')
  // console.info('Service worker installed')
  // console.info(event)
  // console.info('View service worker in application tab')
  // console.groupEnd('Install event')

  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    cache.addAll(assets)
  })())
})

self.addEventListener('activate', (event) => {
  console.log('Activate event')
  // console.group('Activate event')
  // console.info('Service worker active')
  // console.info(event)
  // console.groupEnd('Activate event')

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => {
        if (key === cacheName) return
        return caches.delete(key)
      }))
    })
  )
})

self.addEventListener('fetch', (event) => {
  // console.group('Fetch event')
  // console.info('Fetch occurred')
  // console.info('Fetch count:', ++fetchCount)
  // console.info(event.request.method)
  // console.info(event.request.url)
  // console.info(event)
  // console.groupEnd('Fetch event')

  console.log('foo')
  console.log('Fetch', event.request.url)
  console.log('Request', event.request)

  event.respondWith(
    caches.match(event.request).then(response => {
      console.log('Cache match', event.request.url, response)

      if (response == null) {
        return fetch(event.request)
      }

      if (response.redirected) {
        return cleanResponse(response)
      }

      return response
    })
  )
})

function cleanResponse(response) {
  const clonedResponse = response.clone();

  // Not all browsers support the Response.body stream, so fall back to reading
  // the entire body into memory as a blob.
  const bodyPromise = 'body' in clonedResponse ?
    Promise.resolve(clonedResponse.body) :
    clonedResponse.blob();

  return bodyPromise.then((body) => {
    // new Response() is happy when passed either a stream or a Blob.
    return new Response(body, {
      headers: clonedResponse.headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
    });
  });
}
