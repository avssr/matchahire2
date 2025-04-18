import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../lib/supabase'

async function setupDatabase() {
  // Create SmartJoules company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: 'SmartJoules',
      website: 'https://smartjoules.in',
      industry: 'Energy Efficiency',
      description: "India's leading energy efficiency firm. SmartJoules is on a mission to eliminate energy waste in commercial buildings.",
      values: ['Sustainability', 'Ownership', 'Innovation', 'Excellence'],
      culture: 'A fast-paced, mission-driven team that thrives on solving meaningful climate problems.',
      tone: 'Visionary, detail-oriented, warm',
      persona_context: {
        vision: 'To eliminate energy waste from every building on the planet.',
        mission: 'Build reliable, scalable, AI-first automation tools for energy optimization.',
        policies: 'Flexible work culture, no-bureaucracy decision-making, flat team hierarchy.',
        culture_summary: 'We want builders who take initiative, communicate well, and thrive in collaborative chaos.'
      }
    })
    .select()
    .single()

  if (companyError) {
    console.error('Error creating company:', companyError)
    return
  }

  // Create roles and their personas
  const roles = [
    {
      title: 'Associate Engineer – Execution (BMS Team)',
      location: 'Bangalore',
      level: 'Entry',
      tags: ['On-site', 'Full-time'],
      description: 'Join our BMS team to help implement and optimize building management systems.',
      requirements: [
        'Bachelor\'s degree in Engineering',
        '0-2 years of experience',
        'Strong problem-solving skills'
      ],
      responsibilities: [
        'Implement BMS solutions',
        'Monitor system performance',
        'Troubleshoot issues'
      ],
      persona: {
        persona_name: 'Aakash',
        tone: 'Supportive and practical',
        conversation_mode: 'structured',
        system_prompt: 'You are Aakash, a supportive and practical engineering lead at SmartJoules. Your role is to help candidates understand the technical aspects of the BMS team while assessing their fit.',
        question_sequence: {
          questions: [
            {
              id: '1',
              text: 'What interests you about building management systems?',
              type: 'open'
            },
            {
              id: '2',
              text: 'Describe a technical problem you solved recently.',
              type: 'open'
            },
            {
              id: '3',
              text: 'How do you approach learning new technologies?',
              type: 'open'
            }
          ]
        },
        scoring_prompt: 'Evaluate the candidate\'s technical aptitude, problem-solving approach, and enthusiasm for the role.',
        email_prompt: 'Generate a summary of the candidate\'s responses and your assessment.'
      }
    },
    {
      title: 'Business Development Representative – BMS',
      location: 'Bangalore',
      level: 'Mid-level',
      tags: ['Client-facing', 'Full-time'],
      description: 'Drive business growth by connecting with potential clients and understanding their needs.',
      requirements: [
        '2-4 years of sales experience',
        'Strong communication skills',
        'Technical aptitude'
      ],
      responsibilities: [
        'Identify potential clients',
        'Conduct sales meetings',
        'Close deals'
      ],
      persona: {
        persona_name: 'Shruti',
        tone: 'Assertive, ambitious, relationship-driven',
        conversation_mode: 'conversational',
        system_prompt: 'You are Shruti, an assertive and ambitious sales leader at SmartJoules. Your role is to assess candidates\' sales acumen and cultural fit.',
        question_sequence: {
          questions: [
            {
              id: '1',
              text: 'Tell me about your most challenging sales experience.',
              type: 'open'
            },
            {
              id: '2',
              text: 'How do you build relationships with potential clients?',
              type: 'open'
            },
            {
              id: '3',
              text: 'What\'s your approach to handling rejection?',
              type: 'open'
            }
          ]
        },
        scoring_prompt: 'Evaluate the candidate\'s sales experience, relationship-building skills, and resilience.',
        email_prompt: 'Generate a summary of the candidate\'s responses and your assessment.'
      }
    },
    {
      title: 'Director – Operations',
      location: 'Bangalore',
      level: 'Senior',
      tags: ['Leadership', 'Strategy'],
      description: 'Lead our operations team and drive strategic initiatives.',
      requirements: [
        '10+ years of operations experience',
        'Strong leadership skills',
        'Strategic thinking'
      ],
      responsibilities: [
        'Lead operations team',
        'Develop strategies',
        'Optimize processes'
      ],
      persona: {
        persona_name: 'Rahul',
        tone: 'Decisive, results-oriented',
        conversation_mode: 'structured',
        system_prompt: 'You are Rahul, a decisive and results-oriented operations leader at SmartJoules. Your role is to assess candidates\' leadership capabilities and strategic thinking.',
        question_sequence: {
          questions: [
            {
              id: '1',
              text: 'Describe your leadership style.',
              type: 'open'
            },
            {
              id: '2',
              text: 'How do you handle operational challenges?',
              type: 'open'
            },
            {
              id: '3',
              text: 'What\'s your approach to team development?',
              type: 'open'
            }
          ]
        },
        scoring_prompt: 'Evaluate the candidate\'s leadership experience, strategic thinking, and operational expertise.',
        email_prompt: 'Generate a summary of the candidate\'s responses and your assessment.'
      }
    },
    {
      title: 'Financial Controller',
      location: 'Bangalore',
      level: 'Senior',
      tags: ['Finance', 'Leadership'],
      description: 'Oversee financial operations and reporting.',
      requirements: [
        'CA/CPA qualification',
        '8+ years of experience',
        'Strong analytical skills'
      ],
      responsibilities: [
        'Financial reporting',
        'Budget management',
        'Compliance oversight'
      ],
      persona: {
        persona_name: 'Tanvi',
        tone: 'Analytical and composed',
        conversation_mode: 'conversational',
        system_prompt: 'You are Tanvi, an analytical and composed financial leader at SmartJoules. Your role is to assess candidates\' financial expertise and leadership capabilities.',
        question_sequence: {
          questions: [
            {
              id: '1',
              text: 'Describe your approach to financial reporting.',
              type: 'open'
            },
            {
              id: '2',
              text: 'How do you ensure compliance?',
              type: 'open'
            },
            {
              id: '3',
              text: 'What\'s your experience with budget management?',
              type: 'open'
            }
          ]
        },
        scoring_prompt: 'Evaluate the candidate\'s financial expertise, compliance knowledge, and leadership skills.',
        email_prompt: 'Generate a summary of the candidate\'s responses and your assessment.'
      }
    }
  ]

  for (const role of roles) {
    // Create role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .insert({
        company_id: company.id,
        title: role.title,
        location: role.location,
        level: role.level,
        tags: role.tags,
        description: role.description,
        requirements: role.requirements,
        responsibilities: role.responsibilities
      })
      .select()
      .single()

    if (roleError) {
      console.error(`Error creating role ${role.title}:`, roleError)
      continue
    }

    // Create persona
    const { error: personaError } = await supabase
      .from('personas')
      .insert({
        role_id: roleData.id,
        ...role.persona
      })

    if (personaError) {
      console.error(`Error creating persona for ${role.title}:`, personaError)
    }
  }

  console.log('Database setup completed successfully!')
}

setupDatabase().catch(console.error) 