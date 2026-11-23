import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Plate from '../components/Plate.jsx';
import Blocks, { slugify } from '../components/blocks/Blocks.jsx';
import Reactions from '../components/Reactions.jsx';
import NotFound from './NotFound.jsx';
import LocalNav from '../components/LocalNav.jsx';
import { posts, postBySlug, fmtDate } from '../data/posts/index.js';
import { site } from '../config/site.js';
import DOMPurify from 'dompurify';
import { fetchJournalPost } from '../lib/journal.js';

// Squarespace bodies come with their own block markup and lazy-loaded images. Keep the content,
// drop scripts and styling, and point images at a real source.
function cleanBody(html) {
  const safe = DOMPurify.sanitize(html, { FORBID_TAGS: ['style', 'script', 'noscript', 'form', 'input', 'button'], FORBID_ATTR: ['style'] });
  const doc = new DOMParser().parseFromString(`<div>${safe}</div>`, 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('data-src') || img.getAttribute('data-image') || img.getAttribute('src');
    if (src) img.setAttribute('src', src.startsWith('//') ? `https:${src}` : src.includes('squarespace-cdn') && !src.includes('format=') ? `${src}?format=1500w` : src);
    img.setAttribute('loading', 'lazy');
    img.removeAttribute('width'); img.removeAttribute('height');
  });
  doc.querySelectorAll('a[href^="http"]').forEach((a) => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noreferrer'); });
  return doc.body.firstChild.innerHTML;
}

function RemotePost({ slug }) {
  const [post, setPost] = useState(undefined);
  const progress = useReadingProgress();
  useEffect(() => {
    let live = true;
    fetchJournalPost(slug).then((p) => live && setPost(p)).catch(() => live && setPost(null));
    return () => { live = false; };
  }, [slug]);
  useEffect(() => { if (post) document.title = `${post.title} | Deva Kane`; }, [post]);
  const body = useMemo(() => (post?.body ? cleanBody(post.body) : ''), [post]);

  if (post === undefined) return <div className="post post--loading container"><p className="meta">Loading the article</p></div>;
  if (!post) return <NotFound />;
  return (
    <article className="post post--sq">
      <LocalNav title={post.title} cta={{ label: 'All articles', to: '/journal' }} revealAfter={420} />
      <div className="post__progress" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></div>
      <header className={`post__head ${post.image ? '' : 'post__head--solo'}`}>
        <div className="post__head-text">
          <Link to={`/journal?topic=${encodeURIComponent(post.topic)}`} className="topic">{post.topic}</Link>
          <h1>{post.title}</h1>
          {post.dek && <p className="post__dek">{post.dek}</p>}
          <p className="meta">By {post.author || site.agent.name}, {fmtDate(post.date)}. {post.minutes} min read.</p>
        </div>
        {post.image && <Plate className="post__cover" photo={post.image} alt="" />}
      </header>
      <div className="post__layout post__layout--single">
        <div className="prose prose--sq">
          <div dangerouslySetInnerHTML={{ __html: body }} />
          <aside className="author">
            <Plate className="author__img" scene="coast" tone={['#A8CFC6', '#0F2C3A']} photo={site.agent.portrait} alt={site.agent.name} sun={false} />
            <div>
              <strong>{site.agent.name}</strong>
              <p>{site.agent.title} with {site.agent.brokerage}. Questions about anything here? <Link to="/contact">Send a note.</Link></p>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      setP(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight));
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return p;
}

function useActiveHeading(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '0px 0px -70% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids.join()]);
  return active;
}

export default function Post() {
  const { slug } = useParams();
  if (!postBySlug[slug]) return <RemotePost slug={slug} />;
  return <GuidePost slug={slug} />;
}

function GuidePost({ slug }) {
  const post = postBySlug[slug];
  const progress = useReadingProgress();
  const headings = post ? post.blocks.filter((b) => b.type === 'h2').map((b) => ({ id: slugify(b.text), text: b.text })) : [];
  const active = useActiveHeading(headings.map((h) => h.id));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post) document.title = `${post.title} | Deva Kane`;
  }, [post]);

  if (!post) return <NotFound />;

  const i = posts.indexOf(post);
  const next = posts[(i + 1) % posts.length];

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <article className="post">
      <LocalNav title={post.title} cta={{ label: copied ? 'Link copied' : 'Share', onClick: share }} revealAfter={420} />
      <div className="post__progress" aria-hidden="true"><i style={{ transform: `scaleX(${progress})` }} /></div>

      <header className="post__head">
        <div className="post__head-text">
          <Link to={`/journal?topic=${post.topic}`} className="topic">{post.topic}</Link>
          <h1>{post.title}</h1>
          <p className="post__dek">{post.dek}</p>
          <p className="meta">By {site.agent.name}, {fmtDate(post.date)}. {post.minutes} min read.</p>
        </div>
        <Plate className="post__cover" scene={post.cover.scene} tone={post.cover.tone} photo={post.cover.photo} alt="" />
      </header>

      <div className="post__layout">
        {headings.length > 1 && (
          <nav className="toc" aria-label="In this article">
            <p>In this article</p>
            <ul>
              {headings.map((h) => (
                <li key={h.id}><a href={`#${h.id}`} className={active === h.id ? 'is-on' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{h.text}</a></li>
              ))}
            </ul>
            <button className="textbtn" onClick={share}>{copied ? 'Link copied' : 'Share this article'}</button>
          </nav>
        )}
        <div className="prose">
          <Blocks blocks={post.blocks} />
          <Reactions slug={post.slug} />
          <aside className="author">
            <Plate className="author__img" scene="coast" tone={['#A8CFC6', '#0F2C3A']} photo={site.agent.portrait} alt={site.agent.name} sun={false} />
            <div>
              <strong>{site.agent.name}</strong>
              <p>{site.agent.title} with {site.agent.brokerage}. Questions about anything here? <Link to="/contact">Send a note.</Link></p>
            </div>
          </aside>
        </div>
      </div>

      {next && next !== post && (
        <Link to={`/journal/${next.slug}`} className="next">
          <span>Next article</span>
          <strong>{next.title}</strong>
        </Link>
      )}
    </article>
  );
}
