import rootDomain from './rootDomain';

const _gfyCatRegex = /^https?:\/\/(.*\.?)gfycat.com/;
const _gfycatMobileBase = 'https://thumbs.gfycat.com';
const _gfycatWebmBase = 'https://zippy.gfycat.com';
const _GIF_EXTENSION = /\.gif$/;
const _GIF_V_EXTENSION = /\.gifv$/;

const _IMGUR_GALLERY_PATH = /\/gallery\//;

const _IMGUR_GIFV_QUERY_PARAMS = /\.gif\?.*$/;

function gfycatMP4Url(gfyCatUrl) {
  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${gfyCatUrl.replace(_gfyCatRegex, _gfycatMobileBase)
                     .replace(_GIF_EXTENSION, '')}-mobile.mp4`;
}

function gfyCatWebmURL(gfyCatUrl) {
  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${gfyCatUrl.replace(_gfyCatRegex, _gfycatWebmBase)
                     .replace(_GIF_EXTENSION, '')}.webm`;
}

function gfycatPosterUrl(gfyCatUrl) {
  // gif doesn't seem to be there, so the .gif replace is a safety check
  return `${gfyCatUrl.replace(_gfyCatRegex, _gfycatMobileBase)
                     .replace(_GIF_EXTENSION, '')}-mobile.jpg`;
}

function posterForHrefIfGiphyCat(url) {
  const urlRoot = rootDomain(url);
  if (urlRoot === 'gfycat.com') {
    return gfycatPosterUrl(url);
  }
}

export { posterForHrefIfGiphyCat };

export default function gifToHTML5Sources(url) {
  const urlRoot = rootDomain(url);
  if (!urlRoot) {
    return;
  }

  if (urlRoot === 'gfycat.com') {
    return {
      mp4: gfycatMP4Url(url),
      webm: gfyCatWebmURL(url),
      poster: gfycatPosterUrl(url),
    };
  }

  if (urlRoot === 'giphy.com' && _GIF_EXTENSION.test(url)) {
    return {
      mp4: url.replace(_GIF_EXTENSION, '.mp4'),
      poster: url.replace(_GIF_EXTENSION, '_s.gif'),
    };
  }

  // If it's imgur, make a gifv link
  if (urlRoot === 'imgur.com') {
    let imgurURL = url;

    // strip query params
    imgurURL = imgurURL.replace(_IMGUR_GIFV_QUERY_PARAMS, '.gifv');

    // Sometimes we get imgur urls that have /gallery/ in them
    // when they should really point to just the gif. Sometimes they have the
    // wrong extension and maybe include query params. Clean that all up
    if (_IMGUR_GALLERY_PATH.test(imgurURL) || /\.jpg(\?.*$)$/.test(imgurURL)) {
      imgurURL = imgurURL.replace(_IMGUR_GALLERY_PATH, '/').replace(/\.(jpg|gif|gifv)(\?.*$)?/, '');
      imgurURL = `${imgurURL}.gifv`;
    }

    if (_GIF_V_EXTENSION.test(imgurURL)) {
      return {
        webm: imgurURL.replace(_GIF_V_EXTENSION, '.webm'),
        mp4: imgurURL.replace(_GIF_V_EXTENSION, '.mp4'),
        poster: imgurURL.replace(_GIF_V_EXTENSION, 'h.jpg'),
      };
    }
  }
}
