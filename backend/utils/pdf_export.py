import io
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

ACCENT = colors.HexColor('#7c6af7')
DARK = colors.HexColor('#0a0a0f')
LIGHT = colors.HexColor('#ffffff')
MUTED = colors.HexColor('#c0c0d0')
SUCCESS = colors.HexColor('#4ade80')
WARNING = colors.HexColor('#fbbf24')
DANGER = colors.HexColor('#f87171')

VERDICT_COLORS = {
    'Strong': SUCCESS,
    'Promising': ACCENT,
    'Needs work': WARNING,
    'Risky': DANGER,
}


def make_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        'PitchTitle', fontSize=28, textColor=DARK, spaceAfter=6,
        fontName='Times-Bold', alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'SectionHeader', fontSize=14, textColor=ACCENT, spaceBefore=14,
        spaceAfter=6, fontName='Times-Bold'
    ))
    styles.add(ParagraphStyle(
        'Body', fontSize=10, textColor=DARK, leading=14, fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'Muted', fontSize=9, textColor=colors.HexColor('#6a6a8a'), fontName='Helvetica'
    ))
    styles.add(ParagraphStyle(
        'VerdictLabel', fontSize=18, textColor=ACCENT, fontName='Times-Bold',
        alignment=TA_CENTER
    ))
    return styles


def generate_pdf(analysis):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            rightMargin=20*mm, leftMargin=20*mm,
                            topMargin=20*mm, bottomMargin=20*mm)
    styles = make_styles()
    story = []

    idea = analysis.idea
    verdict_color = VERDICT_COLORS.get(analysis.verdict or '', ACCENT)

    # Cover
    story.append(Spacer(1, 20*mm))
    story.append(Paragraph(idea.title or 'Startup Analysis', styles['PitchTitle']))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        f'<font color="#7c6af7"><b>{analysis.verdict or "—"}</b></font>  •  '
        f'Score: <b>{analysis.overall_score or "—"}/10</b>  •  '
        f'{datetime.utcnow().strftime("%d %B %Y")}',
        styles['Body']
    ))
    story.append(HRFlowable(width='100%', thickness=1, color=ACCENT, spaceAfter=8*mm))

    # Executive summary
    story.append(Paragraph('Executive summary', styles['SectionHeader']))
    story.append(Paragraph(idea.pitch_text or '', styles['Body']))
    story.append(Spacer(1, 6*mm))

    # Viability scores
    story.append(Paragraph('Viability scores', styles['SectionHeader']))
    score_data = [['Dimension', 'Score', 'Justification']]
    for s in (analysis.scores or []):
        score_data.append([
            s.dimension.replace('_', ' ').title(),
            f'{s.score:.1f}/10',
            Paragraph(s.justification or '', styles['Body']),
        ])
    if len(score_data) > 1:
        t = Table(score_data, colWidths=[45*mm, 20*mm, 105*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
            ('TEXTCOLOR', (0, 0), (-1, 0), LIGHT),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5ff')]),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#ddddee')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
    story.append(Spacer(1, 6*mm))

    # SWOT
    if analysis.swot:
        story.append(Paragraph('SWOT analysis', styles['SectionHeader']))
        swot = analysis.swot
        swot_data = [
            [
                Paragraph('<b>Strengths</b><br/>' + '<br/>'.join(f'• {s}' for s in (swot.strengths or [])), styles['Body']),
                Paragraph('<b>Weaknesses</b><br/>' + '<br/>'.join(f'• w' for w in (swot.weaknesses or [])), styles['Body']),
            ],
            [
                Paragraph('<b>Opportunities</b><br/>' + '<br/>'.join(f'• {o}' for o in (swot.opportunities or [])), styles['Body']),
                Paragraph('<b>Threats</b><br/>' + '<br/>'.join(f'• {t}' for t in (swot.threats or [])), styles['Body']),
            ],
        ]
        # Fix weaknesses rendering
        swot_data[0][1] = Paragraph('<b>Weaknesses</b><br/>' + '<br/>'.join(f'• {w}' for w in (swot.weaknesses or [])), styles['Body'])
        t = Table(swot_data, colWidths=[85*mm, 85*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#e8f5e9')),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#fce4ec')),
            ('BACKGROUND', (0, 1), (0, 1), colors.HexColor('#e3f2fd')),
            ('BACKGROUND', (1, 1), (1, 1), colors.HexColor('#fff8e1')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddddee')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 6*mm))

    # Competitors
    if analysis.competitors:
        story.append(Paragraph('Competitor landscape', styles['SectionHeader']))
        comp_data = [['Name', 'Type', 'Scope', 'Hottest Product', 'Stage']]
        for c in analysis.competitors:
            comp_data.append([c.name, c.type, c.scope, c.hottest_product or '', c.funding_stage or ''])
        t = Table(comp_data, colWidths=[35*mm, 22*mm, 20*mm, 50*mm, 40*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), ACCENT),
            ('TEXTCOLOR', (0, 0), (-1, 0), LIGHT),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5ff')]),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#ddddee')),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t)
        story.append(Spacer(1, 6*mm))

    # Personas
    if analysis.personas:
        story.append(Paragraph('Target personas', styles['SectionHeader']))
        persona_rows = []
        for p in analysis.personas:
            persona_rows.append(
                Paragraph(
                    f'<b>{p.name}</b>, {p.age} — {p.role}<br/>'
                    f'<i>Pain:</i> {p.pain_point}<br/>'
                    f'<i>WTP:</i> {p.willingness_to_pay}',
                    styles['Body']
                )
            )
        if len(persona_rows) == 1:
            persona_rows.append(Paragraph('', styles['Body']))
        pairs = [persona_rows[i:i+2] for i in range(0, len(persona_rows), 2)]
        for pair in pairs:
            t = Table([pair], colWidths=[85*mm, 85*mm])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0effe')),
                ('GRID', (0, 0), (-1, -1), 0.5, ACCENT),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(t)
            story.append(Spacer(1, 3*mm))
        story.append(Spacer(1, 3*mm))

    # Pivot suggestions
    if analysis.pivot_suggestions:
        story.append(Paragraph('Pivot suggestions', styles['SectionHeader']))
        for suggestion in analysis.pivot_suggestions:
            story.append(Paragraph(f'• {suggestion}', styles['Body']))
        story.append(Spacer(1, 6*mm))

    def add_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#6a6a8a'))
        canvas.drawString(20*mm, 12*mm, 'PitchIQ — AI-powered startup validator')
        canvas.drawRightString(A4[0] - 20*mm, 12*mm, f'Page {doc.page}')
        canvas.restoreState()

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    buf.seek(0)
    return buf.read()
