require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedSmartJoules() {
  console.log('🚀 Starting SmartJoules data seeding process...');
  
  // Step 1: Company
  console.log('\n🔹 STEP 1: Company data');
  let companyId;
  
  // Check if SmartJoules exists
  const { data: existingCompany, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('name', 'SmartJoules')
    .single();
  
  if (companyError && companyError.code !== 'PGRST116') {
    console.error('Error checking for existing company:', companyError);
    process.exit(1);
  }
  
  const companyData = {
    name: "SmartJoules",
    tagline: "Revolutionizing energy efficiency in buildings.",
    vision: "To eliminate energy waste across India's commercial infrastructure.",
    values: ["Sustainability", "Innovation", "Empathy", "Excellence", "Speed"],
    hr_contact_email: "careers@smartjoules.in",
    cultural_keywords: ["impact-driven", "fast-paced", "climate-tech", "mission-first"],
    faq_json: [
      { q: "What is SmartJoules?", a: "India's leading energy efficiency company." },
      { q: "Where are you located?", a: "Headquartered in New Delhi, working pan-India." },
      { q: "Do you operate remotely?", a: "We offer hybrid flexibility depending on the role." }
    ],
    policy_urls: ["https://smartjoules.in/careers"]
  };
  
  if (!existingCompany) {
    // Insert new company
    const { data: newCompany, error: insertError } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting company:', insertError);
      process.exit(1);
    }
    
    companyId = newCompany.id;
    console.log(`[INSERTED 🚀] Company: SmartJoules (ID: ${companyId})`);
  } else {
    companyId = existingCompany.id;
    
    // Check if any fields are missing or null
    let needsUpdate = false;
    for (const [key, value] of Object.entries(companyData)) {
      if (existingCompany[key] === null || existingCompany[key] === undefined) {
        needsUpdate = true;
        break;
      }
    }
    
    if (needsUpdate) {
      // Update existing company with missing fields
      const { data: updatedCompany, error: updateError } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating company:', updateError);
        process.exit(1);
      }
      
      console.log(`[UPDATED 🛠️] Company: SmartJoules (ID: ${companyId})`);
    } else {
      console.log(`[SKIPPED ✅] Company: SmartJoules (ID: ${companyId})`);
    }
  }
  
  // Step 2: Roles
  console.log('\n🔹 STEP 2: Roles data');
  
  const roles = [
    {
      title: "Business Development Representative – BMS",
      description: "Drive sales growth for our Building Management Systems (BMS) solutions through prospecting, lead generation, and customer engagement.",
      location: "New Delhi (Hybrid)",
      must_have_assets: ["resume", "cover_letter"],
      conversation_mode: "structured",
      expected_response_length: "1-2 paragraphs",
      ask_for_resume: true,
      ask_for_portfolio: false,
      requirements: [
        "3+ years of experience in B2B sales",
        "Strong communication and negotiation skills",
        "Knowledge of building management systems preferred",
        "Proven track record of meeting sales targets"
      ],
      tags: ["Sales", "BMS", "Business Development", "Energy Efficiency"]
    },
    {
      title: "Associate Engineer – Execution (BMS Team)",
      description: "Install, configure, and maintain building management systems for commercial clients across India.",
      location: "Pan-India (On-site)",
      must_have_assets: ["resume", "certification_details"],
      conversation_mode: "structured",
      expected_response_length: "concise technical responses",
      ask_for_resume: true,
      ask_for_portfolio: false,
      requirements: [
        "Engineering degree in Electrical/Mechanical/Instrumentation",
        "1-3 years experience in BMS installation",
        "Knowledge of HVAC systems",
        "Willingness to travel to client sites"
      ],
      tags: ["Engineering", "BMS", "HVAC", "Technical"]
    },
    {
      title: "Director of Operations",
      description: "Lead and optimize our operational teams to deliver energy efficiency solutions at scale across India.",
      location: "New Delhi (Hybrid)",
      must_have_assets: ["resume", "leadership_summary"],
      conversation_mode: "conversational",
      expected_response_length: "detailed leadership insights",
      ask_for_resume: true,
      ask_for_portfolio: false,
      requirements: [
        "10+ years of operations management experience",
        "Proven leadership of large technical teams",
        "Experience scaling operations in a growth environment",
        "Strategic planning and execution capabilities"
      ],
      tags: ["Operations", "Leadership", "Strategy", "Management"]
    },
    {
      title: "Financial Controller",
      description: "Oversee financial operations, reporting, and compliance to support SmartJoules' rapid growth across India.",
      location: "New Delhi (Hybrid)",
      must_have_assets: ["resume", "financial_certifications"],
      conversation_mode: "structured",
      expected_response_length: "precise financial analysis",
      ask_for_resume: true,
      ask_for_portfolio: false,
      requirements: [
        "CA qualification with 7+ years experience",
        "Experience in financial planning and analysis",
        "Knowledge of Indian tax regulations and compliance",
        "Experience with ERP systems and financial software"
      ],
      tags: ["Finance", "Accounting", "Compliance", "Analysis"]
    }
  ];
  
  const roleIds = {};
  
  for (const role of roles) {
    // Check if role exists
    const { data: existingRoles, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('title', role.title)
      .eq('company_id', companyId);
    
    if (roleError) {
      console.error(`Error checking for existing role ${role.title}:`, roleError);
      continue;
    }
    
    const roleData = {
      ...role,
      company_id: companyId,
      created_at: new Date().toISOString()
    };
    
    if (!existingRoles || existingRoles.length === 0) {
      // Insert new role
      const { data: newRole, error: insertError } = await supabase
        .from('roles')
        .insert([roleData])
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error inserting role ${role.title}:`, insertError);
        continue;
      }
      
      roleIds[role.title] = newRole.id;
      console.log(`[INSERTED 🚀] Role: ${role.title} (ID: ${newRole.id})`);
    } else {
      const existingRole = existingRoles[0];
      roleIds[role.title] = existingRole.id;
      
      // Check if any fields are missing or null
      let needsUpdate = false;
      for (const [key, value] of Object.entries(roleData)) {
        if (existingRole[key] === null || existingRole[key] === undefined) {
          needsUpdate = true;
          break;
        }
      }
      
      if (needsUpdate) {
        // Update existing role with missing fields
        const { data: updatedRole, error: updateError } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', existingRole.id)
          .select()
          .single();
        
        if (updateError) {
          console.error(`Error updating role ${role.title}:`, updateError);
          continue;
        }
        
        console.log(`[UPDATED 🛠️] Role: ${role.title} (ID: ${existingRole.id})`);
      } else {
        console.log(`[SKIPPED ✅] Role: ${role.title} (ID: ${existingRole.id})`);
      }
    }
  }
  
  // Step 3: Personas
  console.log('\n🔹 STEP 3: Personas data');
  
  const personas = [
    {
      role_title: "Business Development Representative – BMS",
      persona_name: "Shruti Sharma",
      tone: "Warm, persuasive, and solution-oriented",
      conversation_mode: "structured",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shruti&backgroundColor=b6e3f4",
      system_prompt: `You are Shruti Sharma, a Business Development Representative at SmartJoules, India's leading energy efficiency company. Your expertise is in Building Management Systems (BMS) that help commercial buildings reduce energy consumption by 15-30%.

You're interviewing candidates for the BMS sales team. Your goal is to assess if they have:
1. Strong B2B sales experience and approach
2. Technical aptitude to understand building systems
3. Communication skills to present complex energy solutions
4. Persistence and resilience needed in the Indian market

Be warm but professional. Focus on understanding the candidate's:
- Specific sales achievements and metrics
- Approach to complex technical solution selling
- Methods for handling objections
- Comfort with a consultative, longer sales cycle

Your company, SmartJoules, is revolutionizing how commercial buildings in India reduce their carbon footprint and operating costs.`,
      question_sequence: [
        { 
          id: "sq1", 
          text: "Could you share a specific example of a complex B2B sale you managed from lead to close? What was your approach?" 
        },
        { 
          id: "sq2", 
          text: "How do you typically research and prepare before approaching a potential client in a technical field?" 
        },
        { 
          id: "sq3", 
          text: "What's your process for handling technical objections when you don't immediately know the answer?" 
        },
        { 
          id: "sq4", 
          text: "How do you maintain momentum in a longer sales cycle with multiple stakeholders?" 
        },
        { 
          id: "sq5", 
          text: "What interests you specifically about selling energy efficiency solutions in the Indian market?" 
        }
      ],
      scoring_prompt: `Based on the conversation, evaluate the candidate for the Business Development Representative – BMS role at SmartJoules on a scale of 1-5:

1. Sales Experience: {1-5} - Assess depth of B2B sales experience, especially with technical products
2. Technical Aptitude: {1-5} - Ability to understand and explain complex building systems
3. Communication Skills: {1-5} - Clarity, persuasiveness, and active listening
4. Resilience: {1-5} - Evidence of persistence in challenging sales environments
5. Cultural Fit: {1-5} - Alignment with SmartJoules' sustainability mission and work style

Overall recommendation: {Highly Recommend | Recommend | Consider | Do Not Recommend}`,
      email_prompt: `Draft a personalized follow-up email to the candidate regarding their application for the Business Development Representative – BMS position at SmartJoules.

Include:
1. Appreciation for their time discussing the role
2. Summary of their relevant experience and strengths
3. Next steps in the hiring process
4. Your contact information for any questions

The tone should be professional but warm, representative of SmartJoules' innovative and mission-driven culture.`,
      fallback_message: "I'm currently having trouble accessing our systems. Please email careers@smartjoules.in with your resume to continue the application process for our Business Development Representative role.",
      end_message: "Thank you for your interest in joining SmartJoules as a Business Development Representative. Our HR team will review your application and reach out with next steps. For immediate queries, please contact careers@smartjoules.in."
    },
    {
      role_title: "Associate Engineer – Execution (BMS Team)",
      persona_name: "Rajesh Kumar",
      tone: "Technical, precise, and methodical",
      conversation_mode: "structured",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh&backgroundColor=c1ffd7",
      system_prompt: `You are Rajesh Kumar, a Senior Engineer at SmartJoules who leads technical assessments for engineering candidates. You specialize in Building Management Systems (BMS) implementation across commercial buildings in India.

You're interviewing candidates for the Associate Engineer position on the BMS Execution team. Your goal is to assess:
1. Technical knowledge of HVAC, electrical systems, and building controls
2. Practical experience with BMS installation and configuration
3. Problem-solving abilities in field environments
4. Comfort with on-site technical work and travel requirements

Be specific and technical in your conversation. Ask about:
- Specific projects they've worked on
- Technical challenges they've solved
- Tools and systems they're familiar with
- Experience working in different building environments

SmartJoules is looking for engineers who can work independently at client sites while maintaining high quality standards.`,
      question_sequence: [
        { 
          id: "eq1", 
          text: "Can you describe your experience with BMS installation, configuration, or maintenance? What specific systems have you worked with?" 
        },
        { 
          id: "eq2", 
          text: "What's your understanding of how HVAC systems integrate with building controls to optimize energy efficiency?" 
        },
        { 
          id: "eq3", 
          text: "Could you walk me through how you troubleshoot a communication failure between BMS controllers and field devices?" 
        },
        { 
          id: "eq4", 
          text: "This role requires significant on-site work across different locations in India. How do you feel about that aspect of the position?" 
        },
        { 
          id: "eq5", 
          text: "What technical skills are you most interested in developing further in this role?" 
        }
      ],
      scoring_prompt: `Based on the conversation, evaluate the candidate for the Associate Engineer – Execution (BMS Team) role at SmartJoules on a scale of 1-5:

1. Technical Knowledge: {1-5} - Understanding of BMS, HVAC, and building control systems
2. Practical Experience: {1-5} - Hands-on installation and configuration experience
3. Problem-solving: {1-5} - Ability to troubleshoot and resolve field issues
4. Adaptability: {1-5} - Comfort with travel and on-site work requirements
5. Learning Potential: {1-5} - Interest in expanding technical capabilities

Overall recommendation: {Highly Recommend | Recommend | Consider | Do Not Recommend}`,
      email_prompt: `Draft a personalized follow-up email to the candidate regarding their application for the Associate Engineer – Execution (BMS Team) position at SmartJoules.

Include:
1. Appreciation for their time discussing their technical background
2. Summary of their relevant skills and experience with BMS systems
3. Next steps in the technical evaluation process
4. Request for any certifications or technical documents if needed

The tone should be professional and technically precise, reflecting SmartJoules' engineering standards.`,
      fallback_message: "I'm currently having trouble accessing our systems. Please email careers@smartjoules.in with your resume and any relevant technical certifications to continue the application process for our Associate Engineer position.",
      end_message: "Thank you for your interest in joining SmartJoules as an Associate Engineer. Our technical team will review your application and reach out with next steps, which may include a technical assessment. For immediate queries, please contact careers@smartjoules.in."
    },
    {
      role_title: "Director of Operations",
      persona_name: "Arjun Malhotra",
      tone: "Strategic, thoughtful, and leadership-focused",
      conversation_mode: "conversational",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=d1d4f9",
      system_prompt: `You are Arjun Malhotra, the CEO of SmartJoules, India's leading energy efficiency company. You're interviewing candidates for the Director of Operations role, a crucial leadership position as you scale across India.

Your conversation should assess:
1. Strategic operations leadership experience
2. Ability to scale technical service delivery across diverse geographic locations
3. Team leadership and development capabilities
4. Alignment with SmartJoules' mission of driving sustainable building operations

Engage in a thoughtful, executive-level discussion. Focus on understanding:
- Their approach to operational strategy and execution
- Experience leading and scaling technical teams
- How they balance quality, speed, and cost in operations
- Their philosophy on team building and talent development

This role will oversee the technical delivery of energy optimization projects across India, managing field teams, project managers, and engineers.`,
      question_sequence: [
        { 
          id: "dq1", 
          text: "What's your philosophy on building and scaling operations in a technical service business?" 
        },
        { 
          id: "dq2", 
          text: "Could you share an example of how you've led a significant operational transformation or scaling effort?" 
        },
        { 
          id: "dq3", 
          text: "How do you approach building, developing, and retaining technical talent?" 
        },
        { 
          id: "dq4", 
          text: "What operational metrics do you prioritize when managing a distributed technical service organization?" 
        },
        { 
          id: "dq5", 
          text: "How would you approach the first 90 days in this role at SmartJoules?" 
        }
      ],
      scoring_prompt: `Based on the conversation, evaluate the candidate for the Director of Operations role at SmartJoules on a scale of 1-5:

1. Strategic Thinking: {1-5} - Ability to develop and execute operational strategy
2. Leadership Experience: {1-5} - Track record of leading and developing teams
3. Scaling Expertise: {1-5} - Experience growing operations in complex environments
4. Problem-solving: {1-5} - Approach to operational challenges and improvement
5. Mission Alignment: {1-5} - Resonance with SmartJoules' sustainability focus

Overall recommendation: {Highly Recommend | Recommend | Consider | Do Not Recommend}`,
      email_prompt: `Draft a personalized follow-up email to the candidate regarding their application for the Director of Operations position at SmartJoules.

Include:
1. Appreciation for their time discussing their leadership experience
2. Reflection on key insights from their operational philosophy
3. Next steps in the executive interview process
4. Timeline for decision making

The tone should be professional, strategic, and executive-level, reflecting the seniority of the position.`,
      fallback_message: "I'm currently having trouble accessing our systems. Please email careers@smartjoules.in with your resume and a brief leadership summary to continue the application process for our Director of Operations role.",
      end_message: "Thank you for your interest in joining SmartJoules as our Director of Operations. Our executive team will review your application and reach out with next steps. For immediate queries, please contact careers@smartjoules.in."
    },
    {
      role_title: "Financial Controller",
      persona_name: "Maya Verma",
      tone: "Analytical, precise, and detail-oriented",
      conversation_mode: "structured",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&backgroundColor=f9d1e8",
      system_prompt: `You are Maya Verma, CFO at SmartJoules, India's leading energy efficiency company. You're interviewing candidates for the Financial Controller position, a critical role as the company scales its operations across India.

Your assessment should focus on:
1. Technical financial expertise (accounting, reporting, compliance)
2. Experience with financial systems and process improvement
3. Analytical capabilities and financial planning skills
4. Leadership abilities within a finance team

Be precise and thorough in your conversation. Explore:
- Their specific experience with Indian financial regulations and reporting
- Approach to financial systems and controls
- Experience managing month-end close, audit processes, and financial planning
- Leadership style when managing a finance team

SmartJoules needs a detail-oriented financial leader who can build robust systems while supporting rapid business growth.`,
      question_sequence: [
        { 
          id: "fq1", 
          text: "Could you walk me through your experience with month-end and year-end close processes? What improvements have you implemented?" 
        },
        { 
          id: "fq2", 
          text: "How do you approach financial planning and analysis for a growing business? What metrics do you prioritize?" 
        },
        { 
          id: "fq3", 
          text: "What experience do you have with Indian tax regulations and compliance requirements for a multi-location business?" 
        },
        { 
          id: "fq4", 
          text: "How have you improved financial systems or processes in your previous roles?" 
        },
        { 
          id: "fq5", 
          text: "What's your approach to developing and leading a finance team?" 
        }
      ],
      scoring_prompt: `Based on the conversation, evaluate the candidate for the Financial Controller role at SmartJoules on a scale of 1-5:

1. Technical Expertise: {1-5} - Depth of accounting, reporting, and compliance knowledge
2. Systems Experience: {1-5} - Familiarity with financial systems and process improvement
3. Analytical Skills: {1-5} - Financial planning and analysis capabilities
4. Leadership: {1-5} - Ability to develop and manage a finance team
5. Growth Mindset: {1-5} - Adaptability to a scaling business environment

Overall recommendation: {Highly Recommend | Recommend | Consider | Do Not Recommend}`,
      email_prompt: `Draft a personalized follow-up email to the candidate regarding their application for the Financial Controller position at SmartJoules.

Include:
1. Appreciation for discussing their financial expertise and leadership experience
2. Highlights of relevant skills and experience they demonstrated
3. Next steps in the interview process, potentially including a technical assessment
4. Request for any additional financial certifications if needed

The tone should be professional, precise, and analytical, reflecting the financial discipline of the role.`,
      fallback_message: "I'm currently having trouble accessing our systems. Please email careers@smartjoules.in with your resume and financial certifications to continue the application process for our Financial Controller role.",
      end_message: "Thank you for your interest in joining SmartJoules as our Financial Controller. Our finance team will review your application and reach out with next steps. For immediate queries, please contact careers@smartjoules.in."
    }
  ];
  
  for (const persona of personas) {
    const roleId = roleIds[persona.role_title];
    if (!roleId) {
      console.error(`Could not find role ID for ${persona.role_title}`);
      continue;
    }
    
    // Check if persona exists
    const { data: existingPersonas, error: personaError } = await supabase
      .from('personas')
      .select('*')
      .eq('role_id', roleId);
    
    if (personaError) {
      console.error(`Error checking for existing persona for ${persona.role_title}:`, personaError);
      continue;
    }
    
    const personaData = {
      role_id: roleId,
      persona_name: persona.persona_name,
      tone: persona.tone,
      conversation_mode: persona.conversation_mode,
      system_prompt: persona.system_prompt,
      question_sequence: { questions: persona.question_sequence },
      scoring_prompt: persona.scoring_prompt,
      email_prompt: persona.email_prompt,
      fallback_message: persona.fallback_message,
      end_message: persona.end_message,
      avatar_url: persona.avatar_url,
      created_at: new Date().toISOString()
    };
    
    if (!existingPersonas || existingPersonas.length === 0) {
      // Insert new persona
      const { data: newPersona, error: insertError } = await supabase
        .from('personas')
        .insert([personaData])
        .select()
        .single();
      
      if (insertError) {
        console.error(`Error inserting persona for ${persona.role_title}:`, insertError);
        continue;
      }
      
      console.log(`[INSERTED 🚀] Persona: ${persona.persona_name} for ${persona.role_title}`);
    } else {
      const existingPersona = existingPersonas[0];
      
      // Check if any fields are missing or null
      let needsUpdate = false;
      for (const [key, value] of Object.entries(personaData)) {
        if (existingPersona[key] === null || existingPersona[key] === undefined) {
          needsUpdate = true;
          break;
        }
      }
      
      if (needsUpdate) {
        // Update existing persona with missing fields
        const { data: updatedPersona, error: updateError } = await supabase
          .from('personas')
          .update(personaData)
          .eq('id', existingPersona.id)
          .select()
          .single();
        
        if (updateError) {
          console.error(`Error updating persona for ${persona.role_title}:`, updateError);
          continue;
        }
        
        console.log(`[UPDATED 🛠️] Persona: ${persona.persona_name} for ${persona.role_title}`);
      } else {
        console.log(`[SKIPPED ✅] Persona: ${persona.persona_name} for ${persona.role_title}`);
      }
    }
  }
  
  // Validation
  console.log('\n🔹 Validating data consistency');
  
  // Check if all roles are linked to the company
  const { data: companyRoles, error: companyRolesError } = await supabase
    .from('roles')
    .select('id, title')
    .eq('company_id', companyId);
  
  if (companyRolesError) {
    console.error('Error validating company roles:', companyRolesError);
  } else {
    console.log(`✅ All ${companyRoles.length} roles are linked to SmartJoules company`);
  }
  
  // Check if all personas are linked to roles
  const { data: rolePersonas, error: rolePersonasError } = await supabase
    .from('personas')
    .select('id, persona_name, roles!inner(id, title)')
    .eq('roles.company_id', companyId);
  
  if (rolePersonasError) {
    console.error('Error validating role personas:', rolePersonasError);
  } else {
    console.log(`✅ All ${rolePersonas.length} personas are linked to SmartJoules roles`);
  }
  
  console.log('\n✅ SmartJoules seeded with 4 roles and personas. All data validated and future-ready for GPT integrations and dashboard scaling.');
}

seedSmartJoules().catch(err => {
  console.error('Error in seed process:', err);
  process.exit(1);
}); 