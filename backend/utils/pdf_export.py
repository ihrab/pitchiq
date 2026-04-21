from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from io import BytesIO


def generate_pdf(analysis):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)

    title_style = ParagraphStyle('title', fontSize=24, fontName='Helvetica-Bold', textColor=colors.HexColor('#7c6af7'), spaceAfter=10)
    heading_style = ParagraphStyle('heading', fontSize=14, fontName='Helvetica-Bold', textColor=colors.HexColor('#1a1a2e'), spaceAfter=6, spaceBefore=16)
    body_style = ParagraphStyle('body', fontSize=10, fontName='Helvetica', textColor=colors.HexColor('#333333'), spaceAfter=4, leading=14)
    score_style = ParagraphStyle('score', fontSize=32, fontName='Helvetica-Bold', textColor=colors.HexColor('#7c6af7'), spaceAfter=4)

    story = []
    idea = analysis.idea

    story.append(Paragraph(str(idea.title), title_style))
    story.append(Paragraph(f"Overall Score: {analysis.overall_score}/10 — {analysis.verdict}", score_style))
    story.append(Paragraph(f"Sector: {idea.sector} | Model: {idea.business_model}", body_style))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Pitch Description", heading_style))
    story.append(Paragraph(str(idea.pitch_text), body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Viability Breakdown", heading_style))
    for score in (analysis.scores or []):
        story.append(Paragraph(f"<b>{score.dimension.replace('_', ' ').title()}: {score.score}/10</b>", body_style))
        story.append(Paragraph(str(score.justification), body_style))
        story.append(Spacer(1, 4))

    if analysis.swot:
        story.append(Paragraph("SWOT Analysis", heading_style))
        swot = analysis.swot
        swot_data = [
            ['STRENGTHS', 'WEAKNESSES'],
            ['\n'.join([f'• {s}' for s in (swot.strengths or [])]), '\n'.join([f'• {w}' for w in (swot.weaknesses or [])])],
            ['OPPORTUNITIES', 'THREATS'],
            ['\n'.join([f'• {o}' for o in (swot.opportunities or [])]), '\n'.join([f'• {t}' for t in (swot.threats or [])])],
        ]
        swot_table = Table(swot_data, colWidths=[240, 240])
        swot_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#1d4d2e')),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#4a1a1a')),
            ('BACKGROUND', (0, 2), (0, 2), colors.HexColor('#0a1820')),
            ('BACKGROUND', (1, 2), (1, 2), colors.HexColor('#4a3a00')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(swot_table)
        story.append(Spacer(1, 10))

    if analysis.competitors:
        story.append(Paragraph("Competitor Landscape", heading_style))
        comp_data = [['Company', 'Type', 'Scope', 'Hottest Product', 'Stage']]
        for comp in analysis.competitors:
            comp_data.append([
                str(comp.name),
                str(comp.type),
                str(comp.scope),
                str(comp.hottest_product or '')[:40],
                str(comp.funding_stage or ''),
            ])
        comp_table = Table(comp_data, colWidths=[90, 50, 50, 160, 80])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c6af7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(comp_table)
        story.append(Spacer(1, 10))

    if analysis.personas:
        story.append(Paragraph("Target Personas", heading_style))
        for persona in analysis.personas:
            story.append(Paragraph(f"<b>{persona.name}, {persona.age} — {persona.role}</b>", body_style))
            story.append(Paragraph(f"Pain point: {persona.pain_point}", body_style))
            story.append(Paragraph(f"Willingness to pay: {persona.willingness_to_pay}", body_style))
            story.append(Spacer(1, 6))

    if analysis.pivot_suggestions:
        story.append(Paragraph("Pivot Suggestions", heading_style))
        for pivot in analysis.pivot_suggestions:
            story.append(Paragraph(f"• {pivot}", body_style))

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "Generated by Pitch IQ — pitchiq-frontend.onrender.com",
        ParagraphStyle('footer', fontSize=8, textColor=colors.HexColor('#999999'))
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
