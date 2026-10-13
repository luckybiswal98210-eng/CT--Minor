import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Set high DPI for crisp presentation
plt.figure(figsize=(15, 9.5), dpi=300)
ax = plt.subplot(111)

# Background color (Dark cloud theme)
bg_color = '#0b0f19'
fig = plt.gcf()
fig.patch.set_facecolor(bg_color)
ax.set_facecolor(bg_color)

# Remove axes
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Color Palette
c_client = '#0284c7'     # Sky blue
c_api = '#3b82f6'        # Blue
c_object = '#f59e0b'     # Amber / Cloudinary
c_db = '#10b981'         # Emerald / MongoDB
c_cdn = '#ec4899'        # Pink / CDN
c_event = '#8b5cf6'      # Purple / Notification
c_box_bg = '#131b2e'     # Dark slate
c_border = '#1e293b'     # Border
c_text_main = '#f8fafc'
c_text_sub = '#94a3b8'

def draw_card(x, y, w, h, title, subtitle, badge, accent_color, items=None):
    # Outer box with rounded edges
    rect = patches.FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.8,rounding_size=1.5",
        edgecolor=accent_color,
        facecolor=c_box_bg,
        linewidth=2,
        zorder=2
    )
    ax.add_patch(rect)
    
    # Title badge
    ax.text(x + 2, y + h - 3, badge, fontsize=8.5, fontweight='bold', color=accent_color,
            bbox=dict(boxstyle="round,pad=0.3", facecolor='#1e293b', edgecolor=accent_color, lw=1), zorder=3)
    
    # Title
    ax.text(x + 2, y + h - 7.5, title, fontsize=12, fontweight='bold', color=c_text_main, zorder=3)
    
    # Subtitle
    ax.text(x + 2, y + h - 11, subtitle, fontsize=8.5, color=c_text_sub, zorder=3)
    
    # List items if any
    if items:
        start_y = y + h - 15.5
        for item in items:
            ax.text(x + 3, start_y, item, fontsize=8, color='#cbd5e1', zorder=3)
            start_y -= 3.5

# Main Diagram Title
plt.text(50, 96, "CLOUD-BASED DECOUPLED DATA STORAGE & INGESTION PIPELINE", 
         fontsize=15, fontweight='bold', color='#38bdf8', ha='center', va='center')
plt.text(50, 93, "System Architecture: Decoupling Compute, DBaaS Metadata, and Cloud Object Storage", 
         fontsize=9.5, color='#94a3b8', ha='center', va='center')

# 1. CLIENT TIER (Left)
draw_card(4, 52, 22, 34, 
          "Client Browser Tier", 
          "Citizen Portal & Form Ingestion", 
          "TIER 1: SAAS INGESTION", c_client,
          items=[
              "• User files grievance form",
              "• Attaches photo / PDF evidence",
              "• Selects SLA Priority (6h - 72h)",
              "• Bundles multipart/form-data",
              "• Submits via TLS 1.3 HTTPS"
          ])

# 2. COMPUTE TIER / API GATEWAY (Center Top)
draw_card(38, 52, 24, 34, 
          "Cloud API Gateway", 
          "Node.js Express (Render / Docker)", 
          "TIER 2: PAAS COMPUTE", c_api,
          items=[
              "• Telemetry latency middleware",
              "• Multer binary stream interception",
              "• Asynchronous pipeline splitting",
              "• Zero local permanent storage",
              "• Generates unique Tracking ID"
          ])

# 3. CLOUD OBJECT STORAGE (Right Top)
draw_card(73, 58, 23, 28, 
          "Cloud Object Storage", 
          "Cloudinary / AWS S3 Bucket", 
          "UNSTRUCTURED MEDIA", c_object,
          items=[
              "• Raw binary object ingestion",
              "• Immutable Cloud Public ID",
              "• Returns secure HTTPS CDN URL",
              "• Prevents database bloating",
              "• High durability & redundancy"
          ])

# 4. CLOUD DBaaS (Center Bottom)
draw_card(38, 10, 24, 34, 
          "Cloud Database (DBaaS)", 
          "MongoDB Atlas (AWS ap-south-1)", 
          "STRUCTURED TRANSACTIONAL", c_db,
          items=[
              "• Multi-AZ Replica Set (1P + 2S)",
              "• Stores ticket fields & timestamps",
              "• Stores CDN URL pointer to media",
              "• SLA tracking & state timeline",
              "• Sub-12ms indexed query speed"
          ])

# 5. CDN EDGE CACHE (Right Bottom)
draw_card(73, 10, 23, 34, 
          "Global CDN Edge Tier", 
          "Akamai / Fastly Edge Network", 
          "BANDWIDTH OFFLOADING", c_cdn,
          items=[
              "• Globally distributed edge points",
              "• Complainant downloads evidence",
              "• Completely bypasses Node server",
              "• >95% bandwidth savings on compute",
              "• Low-latency edge caching"
          ])

# 6. EVENT / NOTIFICATION TIER (Left Bottom)
draw_card(4, 10, 22, 34, 
          "Cloud Event & Alerts", 
          "Notification Engine & Telemetry", 
          "FAAS / MAAS MESSAGING", c_event,
          items=[
              "• Emits COMPLAINT_CREATED event",
              "• SMTP email alert to complainant",
              "• Real-time audit stream logging",
              "• Live SLA telemetry tracking",
              "• Webhook state triggers"
          ])

# DRAW CONNECTING ARROWS & DATA FLOWS
arrow_props = dict(arrowstyle="-|>", lw=2, mutation_scale=15)

# Arrow 1: Client -> API Gateway
ax.annotate("", xy=(37.5, 69), xytext=(26.5, 69),
            arrowprops=dict(color=c_client, **arrow_props))
ax.text(32, 70.5, "HTTPS POST\nmultipart/form-data", fontsize=7.5, color=c_client, ha='center', fontweight='bold')

# Arrow 2: API Gateway -> Cloud Object Storage (Binary Stream)
ax.annotate("", xy=(72.5, 72), xytext=(62.5, 72),
            arrowprops=dict(color=c_object, **arrow_props))
ax.text(67.5, 74, "Stream binary\nphotos / PDFs", fontsize=7.5, color=c_object, ha='center', fontweight='bold')

# Arrow 3: Cloud Object Storage -> API Gateway (Return CDN URL pointer)
ax.annotate("", xy=(62.5, 64), xytext=(72.5, 64),
            arrowprops=dict(color=c_object, linestyle='--', **arrow_props))
ax.text(67.5, 61, "Return CDN URL\nPointer reference", fontsize=7.5, color=c_object, ha='center', fontweight='bold')

# Arrow 4: API Gateway -> MongoDB Atlas (Commit JSON document + Pointer)
ax.annotate("", xy=(50, 44.5), xytext=(50, 51.5),
            arrowprops=dict(color=c_db, **arrow_props))
ax.text(56, 48, "Insert Ticket Doc\n+ Media CDN Pointer", fontsize=7.5, color=c_db, ha='center', fontweight='bold')

# Arrow 5: Cloud Object Storage -> CDN Edge (Edge replication)
ax.annotate("", xy=(84.5, 44.5), xytext=(84.5, 57.5),
            arrowprops=dict(color=c_cdn, **arrow_props))
ax.text(88, 51, "Edge Sync\n& Caching", fontsize=7.5, color=c_cdn, ha='center', fontweight='bold')

# Arrow 6: API Gateway -> Event & Alerts
ax.annotate("", xy=(26.5, 27), xytext=(37.5, 53),
            arrowprops=dict(color=c_event, **arrow_props))
ax.text(30, 42, "Dispatch\nCloud Event", fontsize=7.5, color=c_event, ha='center', fontweight='bold')

# Arrow 7: Complainant Direct Retrieval from CDN (Offloading)
ax.annotate("", xy=(93, 44.5), xytext=(26.5, 82),
            arrowprops=dict(color='#f43f5e', linestyle=':', lw=2, mutation_scale=15, 
                            connectionstyle="arc3,rad=-0.35"))
ax.text(60, 89, "DIRECT RETRIEVAL: Users download files directly from CDN Edge (Bypasses API Server!)", 
        fontsize=8.5, color='#fb7185', fontweight='bold', ha='center',
        bbox=dict(boxstyle="round,pad=0.3", facecolor='#1f1220', edgecolor='#f43f5e', lw=1))

# Bottom Legend / Key
plt.text(50, 4, "Key Cloud Concepts Demonstrated: Decoupled Compute & Storage | DBaaS (MongoDB Atlas) | Object Storage (Cloudinary) | CDN Edge Caching | SLA Telemetry", 
         fontsize=8, color='#64748b', ha='center', va='center')

plt.tight_layout()

# Save image in assets and report folder
import os
os.makedirs("assets", exist_ok=True)
os.makedirs("/Users/luckybiswal/Documents/SEM - 5/cloud Technology /report", exist_ok=True)

path1 = "assets/cloud_storage_pipeline_diagram.png"
path2 = "/Users/luckybiswal/Documents/SEM - 5/cloud Technology /report/cloud_storage_pipeline_diagram.png"

plt.savefig(path1, facecolor=bg_color, edgecolor='none', bbox_inches='tight')
plt.savefig(path2, facecolor=bg_color, edgecolor='none', bbox_inches='tight')
print(f"Diagram saved to {path1} and {path2}")
