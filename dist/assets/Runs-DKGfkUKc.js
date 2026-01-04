import{r as m,j as e,e as O,f as _,a as J,u as V,L as A,g as H,X as E,l as X,h as F}from"./index-EQAU33AY.js";import{E as M}from"./EmptyState-4LhyYAnL.js";import{E as Y}from"./ErrorBanner-BZpl489k.js";import{a as Z}from"./useRuns-B67FFnPB.js";import{b as P,c as h}from"./Skeleton-BHG0MYnU.js";import{P as ee}from"./plus-CsoShjA1.js";import{C as U}from"./circle-check-big-DCLhpXb6.js";import{C as se}from"./calendar-B-Yy3hL1.js";import{C as G}from"./circle-play-CsBEaPAm.js";import{C as Q}from"./clock-D-2HZQBK.js";import{C as te}from"./circle-x-FFFZpPL1.js";function ae({currentPage:r,totalPages:n,onPageChange:a,pageSize:k=20,onPageSizeChange:u,showPageSizeSelector:C=!1}){const l=r===1,x=r===n;m.useEffect(()=>{const t=o=>{var c,j,b;((c=document.activeElement)==null?void 0:c.tagName)==="INPUT"||((j=document.activeElement)==null?void 0:j.tagName)==="TEXTAREA"||((b=document.activeElement)==null?void 0:b.tagName)==="SELECT"||(o.key==="ArrowLeft"&&!l?(o.preventDefault(),a(r-1)):o.key==="ArrowRight"&&!x&&(o.preventDefault(),a(r+1)))};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[r,l,x,a]);const f=(()=>{const t=[];if(n<=7)for(let c=1;c<=n;c++)t.push(c);else t.push(1),r<=3?(t.push(2,3,4),t.push("ellipsis"),t.push(n)):r>=n-2?(t.push("ellipsis"),t.push(n-3,n-2,n-1,n)):(t.push("ellipsis"),t.push(r-1,r,r+1),t.push("ellipsis"),t.push(n));return t})(),d=()=>{l||a(r-1)},v=()=>{x||a(r+1)},S=t=>{const o=parseInt(t.target.value,10);u&&u(o),a(1)};return e.jsxs("nav",{"aria-label":"Pagination",role:"navigation",className:"pagination-container",children:[e.jsxs("div",{className:"pagination-wrapper",children:[C&&u&&e.jsxs("div",{className:"page-size-selector",children:[e.jsx("label",{htmlFor:"pageSize",className:"page-size-label",children:"Show"}),e.jsxs("select",{id:"pageSize",value:k,onChange:S,className:"page-size-select","aria-label":"Items per page",children:[e.jsx("option",{value:10,children:"10"}),e.jsx("option",{value:20,children:"20"}),e.jsx("option",{value:50,children:"50"}),e.jsx("option",{value:100,children:"100"})]}),e.jsx("span",{className:"page-size-label",children:"per page"})]}),e.jsxs("div",{className:"pagination-controls",role:"list",children:[e.jsxs("button",{onClick:d,disabled:l,className:"pagination-button pagination-nav","aria-label":"Go to previous page","aria-disabled":l,title:"Previous page (Arrow Left)",role:"listitem",children:[e.jsx(O,{className:"pagination-icon","aria-hidden":"true"}),e.jsx("span",{className:"pagination-nav-text",children:"Previous"})]}),e.jsx("div",{className:"pagination-pages",role:"list",children:f.map((t,o)=>t==="ellipsis"?e.jsx("span",{className:"pagination-ellipsis","aria-hidden":"true",children:"…"},`ellipsis-${o}`):e.jsx("button",{onClick:()=>a(t),className:`pagination-button pagination-page ${r===t?"active":""}`,"aria-label":`${r===t?"Current page, page":"Go to page"} ${t}`,"aria-current":r===t?"page":void 0,role:"listitem",children:t},t))}),e.jsxs("button",{onClick:v,disabled:x,className:"pagination-button pagination-nav","aria-label":"Go to next page","aria-disabled":x,title:"Next page (Arrow Right)",role:"listitem",children:[e.jsx("span",{className:"pagination-nav-text",children:"Next"}),e.jsx(_,{className:"pagination-icon","aria-hidden":"true"})]})]}),e.jsxs("div",{className:"pagination-info","aria-live":"polite","aria-atomic":"true",children:[e.jsxs("span",{className:"sr-only",children:["Page ",r," of ",n]}),e.jsxs("span",{"aria-hidden":"true",children:["Page ",e.jsx("span",{className:"pagination-info-highlight",children:r})," of"," ",e.jsx("span",{className:"pagination-info-highlight",children:n})]})]})]}),e.jsx("style",{jsx:!0,children:`
        .pagination-container {
          width: 100%;
          padding: 1rem 0;
        }

        .pagination-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .pagination-wrapper {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        /* Page size selector */
        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .page-size-label {
          color: var(--muted-foreground);
        }

        .page-size-select {
          padding: 0.375rem 0.75rem;
          background-color: var(--input-background);
          border: 1px solid var(--border);
          border-radius: calc(var(--radius) - 4px);
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-size-select:hover {
          border-color: var(--accent-foreground);
        }

        .page-size-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--ring);
        }

        /* Pagination controls */
        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          min-width: 2.5rem;
          height: 2.5rem;
          background-color: transparent;
          border: 1px solid var(--border);
          border-radius: calc(var(--radius) - 4px);
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .pagination-button:hover:not(:disabled) {
          background-color: var(--accent);
          border-color: var(--accent-foreground);
          color: var(--accent-foreground);
        }

        .pagination-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .pagination-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--ring);
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Navigation buttons (Previous/Next) */
        .pagination-nav {
          gap: 0.375rem;
          padding: 0.5rem 0.75rem;
          min-width: auto;
        }

        .pagination-nav-text {
          font-size: 0.875rem;
        }

        .pagination-icon {
          width: 1rem;
          height: 1rem;
        }

        @media (max-width: 640px) {
          .pagination-nav-text {
            display: none;
          }

          .pagination-nav {
            padding: 0.5rem;
            min-width: 2.5rem;
          }
        }

        /* Page number buttons */
        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .pagination-page {
          font-size: 0.875rem;
        }

        .pagination-page.active {
          background-color: var(--primary);
          border-color: var(--primary);
          color: var(--primary-foreground);
          font-weight: var(--font-weight-medium);
        }

        .pagination-page.active:hover {
          background-color: var(--primary-hover);
          border-color: var(--primary-hover);
          color: var(--primary-foreground);
        }

        /* Ellipsis */
        .pagination-ellipsis {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          color: var(--muted-foreground);
          font-size: 1rem;
          user-select: none;
        }

        /* Page info */
        .pagination-info {
          color: var(--muted-foreground);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .pagination-info-highlight {
          color: var(--foreground);
          font-weight: var(--font-weight-medium);
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .pagination-pages {
            gap: 0.125rem;
          }

          .pagination-button {
            min-width: 2.25rem;
            height: 2.25rem;
            padding: 0.375rem;
            font-size: 0.8125rem;
          }

          .pagination-ellipsis {
            width: 2.25rem;
            height: 2.25rem;
          }
        }

        /* Keyboard hint for desktop users */
        @media (hover: hover) and (pointer: fine) {
          .pagination-nav:not(:disabled):hover::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            padding: 0.25rem 0.5rem;
            background-color: var(--popover);
            border: 1px solid var(--border);
            border-radius: calc(var(--radius) - 6px);
            color: var(--popover-foreground);
            font-size: 0.75rem;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            animation: fadeIn 0.2s ease 0.5s forwards;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* Focus styles for accessibility */
        .pagination-button:focus-visible,
        .page-size-select:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        
        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `})]})}function ge(){const{currentOrg:r}=J(),{getToken:n}=V(),[a,k]=m.useState(""),[u,C]=m.useState(1),[l,x]=m.useState(20),[p,f]=m.useState("all"),[d,v]=m.useState("all"),{runs:S,isLoading:t,error:o}=Z({page:1,pageSize:999}),c=!!o,j=s=>{switch(s){case"completed":return e.jsx(U,{className:"w-5 h-5 text-success"});case"running":return e.jsx(Q,{className:"w-5 h-5 text-warning animate-pulse"});case"failed":return e.jsx(te,{className:"w-5 h-5 text-destructive"});case"queued":return e.jsx(F,{className:"w-5 h-5 text-info"});default:return e.jsx(Q,{className:"w-5 h-5 text-muted-foreground"})}},b=s=>{const i={completed:"bg-success/10 text-success",running:"bg-warning/10 text-warning",failed:"bg-destructive/10 text-destructive",queued:"bg-info/10 text-info"};return e.jsx("span",{className:`px-2 py-1 rounded text-xs ${i[s]}`,children:s.charAt(0).toUpperCase()+s.slice(1)})},T=s=>{if(!s)return e.jsx("span",{className:"px-2 py-1 rounded text-xs bg-muted text-muted-foreground",children:"N/A"});const i={live:"bg-success/10 text-success",paused:"bg-warning/10 text-warning",draft:"bg-muted text-muted-foreground"};return e.jsx("span",{className:`px-2 py-1 rounded text-xs ${i[s]||"bg-muted text-muted-foreground"}`,children:s.charAt(0).toUpperCase()+s.slice(1)})},$=s=>{const i=new Date(s);return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(i)},W=(s,i)=>{const N=new Date(s),z=new Date,w=new Date(z.getFullYear(),z.getMonth(),z.getDate()),D=new Date(w);switch(D.setDate(D.getDate()-1),i){case"today":return N>=w;case"yesterday":return N>=D&&N<w;case"last7days":const R=new Date(w);return R.setDate(R.getDate()-7),N>=R;case"last30days":const L=new Date(w);return L.setDate(L.getDate()-30),N>=L;default:return!0}},g=S.filter(s=>(s.jobTitle.toLowerCase().includes(a.toLowerCase())||s.company.toLowerCase().includes(a.toLowerCase()))&&(p==="all"||s.status===p)&&(d==="all"||W(s.createdAt,d))),y=[p!=="all"?1:0,d!=="all"?1:0].reduce((s,i)=>s+i,0),I=Math.ceil(g.length/l),q=(u-1)*l,K=q+l,B=g.slice(q,K);return m.useEffect(()=>{C(1)},[a,p,d]),e.jsxs("div",{className:"p-4 md:p-8 max-w-7xl mx-auto",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8",children:[e.jsxs("div",{children:[e.jsx("h1",{children:"Runs"}),e.jsx("p",{className:"text-muted-foreground mt-1",children:"View and manage your automation runs"})]}),e.jsxs(A,{to:"/runs/new",className:"flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary-hover hover:scale-[1.02]",children:[e.jsx(ee,{className:"w-5 h-5"}),"New Run"]})]}),e.jsxs("div",{className:"mb-6",children:[e.jsxs("div",{className:"flex flex-col lg:flex-row gap-3",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(H,{className:"absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"}),e.jsx("input",{type:"text",value:a,onChange:s=>k(s.target.value),placeholder:"Search by job title or company...",className:"w-full pl-12 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"})]}),e.jsxs("div",{className:"relative group",children:[e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10",children:e.jsx(U,{className:"w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"})}),e.jsxs("select",{value:p,onChange:s=>f(s.target.value),className:`w-full lg:w-48 appearance-none pl-11 pr-10 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all ${p!=="all"?"border-primary/50 bg-primary/5":"border-input"}`,children:[e.jsx("option",{value:"all",children:"All Statuses"}),e.jsx("option",{value:"completed",children:"✓ Completed"}),e.jsx("option",{value:"running",children:"⏳ Running"}),e.jsx("option",{value:"failed",children:"✗ Failed"}),e.jsx("option",{value:"queued",children:"⏸ Queued"})]}),p!=="all"?e.jsx("button",{onClick:()=>f("all"),className:"absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/10 rounded transition-colors group/clear",title:"Clear filter",children:e.jsx(E,{className:"w-4 h-4 text-muted-foreground group-hover/clear:text-destructive transition-colors"})}):e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",children:e.jsx("svg",{className:"w-4 h-4 text-muted-foreground",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})})]}),e.jsxs("div",{className:"relative group",children:[e.jsx("div",{className:"absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10",children:e.jsx(se,{className:"w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors"})}),e.jsxs("select",{value:d,onChange:s=>v(s.target.value),className:`w-full lg:w-48 appearance-none pl-11 pr-10 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all ${d!=="all"?"border-primary/50 bg-primary/5":"border-input"}`,children:[e.jsx("option",{value:"all",children:"All Dates"}),e.jsx("option",{value:"today",children:"📅 Today"}),e.jsx("option",{value:"yesterday",children:"📆 Yesterday"}),e.jsx("option",{value:"last7days",children:"📊 Last 7 Days"}),e.jsx("option",{value:"last30days",children:"📈 Last 30 Days"})]}),d!=="all"?e.jsx("button",{onClick:()=>v("all"),className:"absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/10 rounded transition-colors group/clear",title:"Clear filter",children:e.jsx(E,{className:"w-4 h-4 text-muted-foreground group-hover/clear:text-destructive transition-colors"})}):e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",children:e.jsx("svg",{className:"w-4 h-4 text-muted-foreground",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})})]}),y>0&&e.jsxs("button",{onClick:()=>{f("all"),v("all")},className:"flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-all whitespace-nowrap font-medium group/clearall",title:"Clear all filters",children:[e.jsx(E,{className:"w-4 h-4 group-hover/clearall:rotate-90 transition-transform"}),e.jsx("span",{className:"hidden sm:inline",children:"Clear all"}),e.jsx("span",{className:"sm:hidden",children:"Clear"})]})]}),(a||y>0)&&e.jsxs("div",{className:"mt-3 flex items-center gap-2 text-sm text-muted-foreground",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("div",{className:"w-1.5 h-1.5 rounded-full bg-primary animate-pulse"}),e.jsxs("span",{children:[g.length," ",g.length===1?"result":"results"," found"]})]}),y>0&&e.jsxs("span",{className:"px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium",children:[y," ",y===1?"filter":"filters"," active"]})]})]}),e.jsx("div",{className:"glass-card rounded-xl overflow-hidden hidden md:block",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"w-full",children:[e.jsx("thead",{className:"bg-muted/30 border-b border-border",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-6 py-4 text-left text-sm",children:"Job Title / Company"}),e.jsx("th",{className:"px-6 py-4 text-left text-sm",children:"Status"}),e.jsx("th",{className:"px-6 py-4 text-left text-sm",children:"Created"}),e.jsx("th",{className:"px-6 py-4 text-left text-sm",children:"Prospects"}),e.jsx("th",{className:"px-6 py-4 text-left text-sm",children:"Campaign"})]})}),e.jsx("tbody",{className:"divide-y divide-border",children:t?e.jsx(e.Fragment,{children:[...Array(5)].map((s,i)=>e.jsx(P,{},i))}):c?e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"px-6 py-2",children:e.jsx(Y,{message:"Failed to load runs. Please try again.",onRetry:()=>X.error("Retry loading runs"),isRetrying:!1})})}):g.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:5,className:"px-6 py-2",children:e.jsx(M,{icon:G,headline:"No runs yet",description:a?"Try adjusting your search query.":"Create your first automation run.",actionLabel:a?void 0:"New Run",onAction:a?void 0:()=>window.location.href="/runs/new"})})}):B.map(s=>e.jsxs("tr",{className:"hover:bg-muted/20 transition-colors",children:[e.jsx("td",{className:"px-6 py-4",children:e.jsxs(A,{to:`/runs/${s.id}`,className:"block hover:text-primary transition-colors",children:[e.jsx("div",{className:"font-medium",children:s.jobTitle}),e.jsx("div",{className:"text-sm text-muted-foreground",children:s.company}),s.error&&e.jsxs("div",{className:"text-xs text-destructive mt-1 flex items-center gap-1",children:[e.jsx(F,{className:"w-3 h-3"}),s.error]})]})}),e.jsx("td",{className:"px-6 py-4",children:e.jsxs("div",{className:"flex items-center gap-2",children:[j(s.status),b(s.status)]})}),e.jsx("td",{className:"px-6 py-4 text-sm text-muted-foreground",children:$(s.createdAt)}),e.jsx("td",{className:"px-6 py-4",children:e.jsx("div",{className:"font-semibold text-primary",children:s.prospectsFound})}),e.jsx("td",{className:"px-6 py-4",children:T(s.campaignStatus)})]},s.id))})]})})}),e.jsx("div",{className:"md:hidden space-y-3",children:t?e.jsx(e.Fragment,{children:[...Array(5)].map((s,i)=>e.jsxs("div",{className:"glass-card rounded-xl p-4",children:[e.jsx(h,{className:"w-48 h-5 mb-2"}),e.jsx(h,{className:"w-32 h-4 mb-3"}),e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx(h,{className:"w-5 h-5 rounded-full"}),e.jsx(h,{className:"w-20 h-6 rounded"})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx(h,{className:"w-24 h-4"}),e.jsx(h,{className:"w-16 h-6 rounded"})]})]},i))}):c?e.jsx("div",{className:"glass-card rounded-xl p-4",children:e.jsx(Y,{message:"Failed to load runs. Please try again.",onRetry:()=>X.error("Retry loading runs"),isRetrying:!1})}):g.length===0?e.jsx("div",{className:"glass-card rounded-xl p-4",children:e.jsx(M,{icon:G,headline:"No runs yet",description:a?"Try adjusting your search query.":"Create your first automation run.",actionLabel:a?void 0:"New Run",onAction:a?void 0:()=>window.location.href="/runs/new"})}):B.map(s=>e.jsxs(A,{to:`/runs/${s.id}`,className:"block glass-card rounded-xl p-4 hover:bg-muted/20 transition-colors",children:[e.jsxs("div",{className:"mb-3",children:[e.jsx("div",{className:"font-medium mb-1",children:s.jobTitle}),e.jsx("div",{className:"text-sm text-muted-foreground",children:s.company}),s.error&&e.jsxs("div",{className:"text-xs text-destructive mt-1.5 flex items-center gap-1",children:[e.jsx(F,{className:"w-3 h-3"}),s.error]})]}),e.jsxs("div",{className:"flex items-center justify-between mb-3 pb-3 border-b border-border",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[j(s.status),b(s.status)]}),e.jsx("div",{className:"text-xs text-muted-foreground",children:$(s.createdAt)})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Prospects:"}),e.jsx("span",{className:"font-semibold text-primary",children:s.prospectsFound})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs text-muted-foreground",children:"Campaign:"}),T(s.campaignStatus)]})]})]},s.id))}),I>1&&e.jsx("div",{className:"mt-4",children:e.jsx(ae,{currentPage:u,totalPages:I,onPageChange:C})})]})}export{ge as Runs};
