import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { Role } from '@/types/gpt';

// Sample data for development purposes
const sampleRoles: Role[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for implementing visual elements that users see and interact with in a web application.',
    requirements: 'Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model. Thorough understanding of React.js and its core principles. Experience with popular React.js workflows (such as Flux or Redux). Familiarity with newer specifications of ECMAScript.',
    location: 'San Francisco, CA (Remote)',
    salary: '$120,000 - $150,000',
    tags: ['React', 'TypeScript', 'Frontend'],
    skills: ['React', 'TypeScript', 'CSS', 'HTML5', 'Redux'],
    company_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    companies: {
      id: '1',
      name: 'TechCorp Inc.',
      logo_url: 'https://via.placeholder.com/150',
      website: 'https://techcorp.example.com',
      description: 'A leading tech company specializing in innovative software solutions.',
      industry: 'Software Development',
      size: '501-1000 employees',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    title: 'Backend Engineer',
    description: 'We are seeking a Backend Engineer to design, develop and maintain our server-side applications. You will work with front-end developers and other team members to establish objectives and design more functional, cohesive codes to enhance the user experience.',
    requirements: 'Proficiency with server-side languages such as Python, Ruby, Java, or Node.js. Understanding of server-side templating languages. Knowledge of database systems like MySQL, MongoDB, and Redis. Experience with API design and development.',
    location: 'New York, NY (Hybrid)',
    salary: '$130,000 - $160,000',
    tags: ['Node.js', 'MongoDB', 'Backend'],
    skills: ['Node.js', 'Express', 'MongoDB', 'RESTful APIs', 'SQL'],
    company_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    companies: {
      id: '2',
      name: 'DataFlow Systems',
      logo_url: 'https://via.placeholder.com/150',
      website: 'https://dataflow.example.com',
      description: 'Specializing in data management and analysis solutions for enterprise clients.',
      industry: 'Data Services',
      size: '201-500 employees',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    description: 'We are looking for a UX/UI Designer to turn our software into easy-to-use products for our clients. You will help establish our product\'s functionality and appearance, including visual design and interactions.',
    requirements: 'Proven experience as a UX Designer, UI Designer or similar role. Experience with design software such as Adobe XD, Sketch, Figma. Solid knowledge of UX design, including user research, creating personas, wireframing, and usability testing.',
    location: 'Austin, TX (Onsite)',
    salary: '$100,000 - $130,000',
    tags: ['Figma', 'UX Design', 'UI Design'],
    skills: ['Figma', 'Sketch', 'User Research', 'Wireframing', 'Prototyping'],
    company_id: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    companies: {
      id: '3',
      name: 'Creative Solutions',
      logo_url: 'https://via.placeholder.com/150',
      website: 'https://creative.example.com',
      description: 'A boutique design agency creating beautiful digital experiences.',
      industry: 'Design Services',
      size: '51-200 employees',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
];

export async function GET() {
  try {
    // In a real application, fetch from database
    // For now, return sample data
    logger.info('Fetching all roles');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(sampleRoles);
  } catch (error) {
    logger.error('Error fetching roles', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
} 