import React from 'react'
import TemplateEssential from './TemplateEssential'
import TemplateExecutive from './TemplateExecutive'
import TemplateCreative from './TemplateCreative'
import TemplateMinimalist from './TemplateMinimalist'
import TemplateAcademic from './TemplateAcademic'
import TemplateTech from './TemplateTech'
import TemplateElegant from './TemplateElegant'

export {
  TemplateEssential,
  TemplateExecutive,
  TemplateCreative,
  TemplateMinimalist,
  TemplateAcademic,
  TemplateTech,
  TemplateElegant
}

export const TEMPLATES_MAP = {
  essential: {
    id: 'essential',
    name: 'Essential Pro',
    desc: 'Un classique moderne et équilibré qui fonctionne toujours',
    component: TemplateEssential
  },
  executive: {
    id: 'executive',
    name: 'Modern Executive',
    desc: 'Sidebar bleu marine, parfait pour postes de direction et managers',
    component: TemplateExecutive
  },
  creative: {
    id: 'creative',
    name: 'Creative Portfolio',
    desc: 'Bannière dynamique et cartes colorées pour créatifs & designers',
    component: TemplateCreative
  },
  minimalist: {
    id: 'minimalist',
    name: 'Premium Minimalist',
    desc: 'Typographie épurée style suisse, monochrome et sophistiqué',
    component: TemplateMinimalist
  },
  academic: {
    id: 'academic',
    name: 'Academic Standard',
    desc: 'Mise en page universitaire classique avec accents vert émeraude',
    component: TemplateAcademic
  },
  tech: {
    id: 'tech',
    name: 'Tech Developer',
    desc: 'Idéal pour développeurs, devops & ingénieurs tech avec stack tags',
    component: TemplateTech
  },
  elegant: {
    id: 'elegant',
    name: 'Élégant Prestige',
    desc: 'Haute couture & finance, teintes bordeaux et champagne doré',
    component: TemplateElegant
  }
}

/**
 * Universal dynamic template renderer
 */
export function RenderCvTemplate({ templateId = 'essential', cvData, innerRef }) {
  const tpl = TEMPLATES_MAP[templateId] || TEMPLATES_MAP.essential
  const Component = tpl.component
  return <Component cvData={cvData} innerRef={innerRef} />
}
