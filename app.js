const $ = (id) => document.getElementById(id);
const form = $("lookup-form");
const input = $("domain-input");
const button = $("search-button");
const message = $("message");
const results = $("results");

const RDAP_BOOTSTRAP = "https://data.iana.org/rdap/dns.json";
const DNS_API = "https://dns.google/resolve";
const CT_API = "https://crt.sh/";

function cleanDomain(value) {
  let domain = value.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, "").split(/[/?#]/)[0].replace(/:\d+$/, "").replace(/\.$/, "");
  if (!domain || domain.length > 253 || !domain.includes(".")) throw new Error("कृपया सही domain name डालें, जैसे example.com");
  if (domain.includes("..") || !/^[a-z0-9.-]+$/.test(domain)) throw new Error("Domain name का format सही नहीं है।");
  const labels = domain.split(".");
  if (labels.some(x => !x || x.length > 63 || x.startsWith("-") || x.endsWith("-"))) throw new Error("Domain name का format सही नहीं है।");
  return domain;
}
function dateText(value) {
  if (!value) return "Not available";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}).format(d);
}
function setText(id, value) { $(id).textContent = value || "Not available"; }
function addDetail(container, label, value) {
  const wrap = document.createElement("div");
  const dt = document.createElement("dt"); dt.textContent = label;
  const dd = document.createElement("dd"); dd.textContent = value || "Not available";
  wrap.append(dt, dd); container.append(wrap);
}
async function getJSON(url, options = {}) {
  const response = await fetch(url, {...options, headers: {"Accept":"application/rdap+json, application/dns-json, application/json", ...(options.headers || {})}});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
async function findRdapUrl(domain) {
  const data = await getJSON(RDAP_BOOTSTRAP);
  const tld = domain.split(".").pop();
  const entry = (data.services || []).find(service => (service[0] || []).some(x => x.toLowerCase() === tld));
  if (!entry || !entry[1]?.length) throw new Error(`.${tld} के लिए RDAP server bootstrap में नहीं मिला।`);
  return entry[1][0].replace(/\/?$/, "/") + "domain/" + encodeURIComponent(domain);
}
function eventDate(events, names) {
  const item = (events || []).find(e => names.includes(String(e.eventAction || "").toLowerCase()));
  return item?.eventDate || "";
}
function getRegistrar(data) {
  const entity = (data.entities || []).find(e => (e.roles || []).includes("registrar"));
  if (!entity) return "";
  const vcard = entity.vcardArray?.[1] || [];
  const fn = vcard.find(x => x[0] === "fn");
  return fn?.[3] || entity.handle || "";
}
function renderRegistration(domain, data) {
  setText("result-domain", domain);
  const creation = eventDate(data.events, ["registration"]);
  const expiry = eventDate(data.events, ["expiration"]);
  const updated = eventDate(data.events, ["last changed", "last update of rdap database"]);
  const registrar = getRegistrar(data);
  setText("creation-date", dateText(creation));
  setText("expiry-date", dateText(expiry));
  setText("registrar", registrar || "Not disclosed");
  const left = expiry ? Math.ceil((new Date(expiry) - new Date()) / 86400000) : null;
  setText("days-left", left === null ? "RDAP expiry date unavailable" : left >= 0 ? `${left} days remaining` : `Expired ${Math.abs(left)} days ago`);
  const list = $("registration-details"); list.replaceChildren();
  addDetail(list, "Domain", domain);
  addDetail(list, "Registrar", registrar);
  addDetail(list, "Creation date", dateText(creation));
  addDetail(list, "Expiration date", dateText(expiry));
  addDetail(list, "Last updated", dateText(updated));
  addDetail(list, "Registry handle", data.handle || "");
  const statuses = $("domain-statuses"); statuses.replaceChildren();
  (data.status || []).forEach(status => { const el=document.createElement("span");el.className="chip";el.textContent=status;statuses.append(el); });
  if (!data.status?.length) statuses.textContent = "No status returned";
  const ns = $("nameservers"); ns.replaceChildren();
  (data.nameservers || []).forEach(item => { const li=document.createElement("li");li.textContent=item.ldhName || item.unicodeName || "Unknown";ns.append(li); });
  if (!ns.children.length) { const li=document.createElement("li");li.textContent="Not available";li.className="muted";ns.append(li); }
  return {creation, expiry, registrar, updated};
}
async function queryDNS(domain, type) {
  const data = await getJSON(`${DNS_API}?name=${encodeURIComponent(domain)}&type=${type}`);
  return (data.Answer || []).map(a => a.data);
}
async function renderDNS(domain) {
  const container = $("dns-records"); container.replaceChildren();
  const types = ["A","AAAA","MX","NS","TXT","CAA"];
  const results = await Promise.allSettled(types.map(type => queryDNS(domain, type)));
  results.forEach((result, i) => {
    const card=document.createElement("div");card.className="dns-card";
    const h=document.createElement("h4");h.textContent=types[i];card.append(h);
    if(result.status==="fulfilled" && result.value.length) result.value.slice(0,8).forEach(value=>{const p=document.createElement("p");p.textContent=value;card.append(p);});
    else {const p=document.createElement("p");p.textContent=result.status==="rejected"?"Lookup failed":"No record returned";card.append(p);}
    container.append(card);
  });
}
async function renderSSL(domain) {
  const container=$("ssl-info");container.replaceChildren();
  try {
    const data=await getJSON(`${CT_API}?q=${encodeURIComponent("%."+domain)}&output=json`);
    const unique=new Map();
    (Array.isArray(data)?data:[]).forEach(cert=>{
      const key=cert.id || `${cert.not_before}-${cert.not_after}-${cert.common_name}`;
      if(!unique.has(key)) unique.set(key,cert);
    });
    const certs=[...unique.values()].sort((a,b)=>new Date(b.not_before)-new Date(a.not_before)).slice(0,5);
    if(!certs.length){container.textContent="No certificate records found.";return;}
    certs.forEach(cert=>{
      const item=document.createElement("div");item.className="ssl-item";
      const name=document.createElement("strong");name.textContent=cert.common_name || cert.name_value || "Certificate";
      const issuer=document.createElement("span");issuer.textContent="Issuer: "+(cert.issuer_name || "Not available");
      const start=document.createElement("span");start.textContent="Valid from: "+dateText(cert.not_before);
      const end=document.createElement("span");end.textContent="Not after: "+dateText(cert.not_after);
      item.append(name,issuer,start,end);container.append(item);
    });
  } catch(e) { container.textContent="SSL certificate lookup उपलब्ध नहीं हुआ (network/CORS/API limitation)."; }
}
function renderNotes(domain, rdapError, info) {
  const list=$("notes");list.replaceChildren();
  const notes=[
    "सिर्फ सार्वजनिक तकनीकी जानकारी ली गई है; owner की personal details इस interface में नहीं दिखाई जातीं।",
    "RDAP में expiry या creation date हर TLD/registry के लिए उपलब्ध होना जरूरी नहीं है।",
    "Registrar के account में दिखाई गई renewal date और registry expiration date अलग हो सकती हैं।",
    "DNS records बदल सकते हैं; यह केवल जाँच के समय का snapshot है।",
    "SSL section Certificate Transparency records दिखाता है, जरूरी नहीं कि वही वर्तमान में live certificate हो।",
    "Website Online/Offline status को browser-only mode में भरोसेमंद तरीके से जाँचना CORS restrictions के कारण शामिल नहीं किया गया है।"
  ];
  if(rdapError) notes.unshift("RDAP lookup: "+rdapError);
  if(!info.expiry) notes.unshift("इस lookup में RDAP expiration event नहीं मिला।");
  notes.forEach(t=>{const li=document.createElement("li");li.textContent=t;list.append(li);});
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent="";
  let domain;
  try { domain=cleanDomain(input.value); }
  catch(e){message.textContent=e.message;return;}
  button.disabled=true;button.innerHTML="<span>जाँच हो रही है…</span>";
  results.classList.remove("hidden");
  setText("result-domain",domain);
  $("checked-at").textContent="Checked at: "+new Date().toLocaleString("en-IN");
  setText("overall-status","Fetching");
  let info={expiry:""};
  let rdapError="";
  try {
    const url=await findRdapUrl(domain);
    const data=await getJSON(url);
    info=renderRegistration(domain,data);
    setText("overall-status","RDAP found");
  } catch(e) {
    rdapError=e.message || "RDAP data unavailable";
    ["creation-date","expiry-date","registrar","days-left"].forEach(id=>setText(id,"Not available"));
    const list=$("registration-details");list.replaceChildren();
    addDetail(list,"Domain",domain);addDetail(list,"RDAP lookup","Not available");
    $("domain-statuses").textContent="Not available";
    $("nameservers").innerHTML="<li class='muted'>Not available</li>";
    setText("overall-status","Partial result");
  }
  await Promise.allSettled([renderDNS(domain),renderSSL(domain)]);
  renderNotes(domain,rdapError,info);
  $("checked-at").textContent="Checked at: "+new Date().toLocaleString("en-IN");
  button.disabled=false;button.innerHTML="<span>जाँचें</span><span aria-hidden='true'>→</span>";
});
