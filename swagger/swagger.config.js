const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS API Documentation',
      version: '1.0.0',
      description: 'Comprehensive Human Resource Management System API',
      contact: {
        name: 'HRMS Support',
        email: 'support@hrms.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.hrms.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            user_id: {
              type: 'integer',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['Super Admin', 'Client Admin', 'HR Account Manager', 'Employee', 'Payroll Specialist', 'Bookkeeping'],
              description: 'User role',
            },
            isActive: {
              type: 'boolean',
              description: 'User active status',
            },
          },
        },
        Organization: {
          type: 'object',
          properties: {
            organization_id: {
              type: 'integer',
              description: 'Organization ID',
            },
            name: {
              type: 'string',
              description: 'Organization name',
            },
            address: {
              type: 'string',
              description: 'Organization address',
            },
            subscriptionPlan: {
              type: 'string',
              enum: ['Basic', 'Professional', 'Enterprise'],
              description: 'Subscription plan',
            },
            clientAdmin: {
              type: 'integer',
              description: 'Client admin user ID',
            },
            hrAccountManager: {
              type: 'integer',
              description: 'HR account manager user ID',
            },
          },
        },
        Employee: {
          type: 'object',
          properties: {
            employee_id: {
              type: 'integer',
              description: 'Employee ID',
            },
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Employee email',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            position: {
              type: 'string',
              description: 'Job position',
            },
            department: {
              type: 'string',
              description: 'Department',
            },
            employmentType: {
              type: 'string',
              enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'],
              description: 'Employment type',
            },
            employmentStatus: {
              type: 'string',
              enum: ['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'],
              description: 'Employment status',
            },
            hireDate: {
              type: 'string',
              format: 'date',
              description: 'Hire date',
            },
            salary: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Salary amount',
                },
                currency: {
                  type: 'string',
                  enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
                  description: 'Currency',
                },
                payFrequency: {
                  type: 'string',
                  enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Annually'],
                  description: 'Pay frequency',
                },
              },
            },
          },
        },
        PayrollCycle: {
          type: 'object',
          properties: {
            cycle_id: {
              type: 'integer',
              description: 'Payroll cycle ID',
            },
            name: {
              type: 'string',
              description: 'Cycle name',
            },
            description: {
              type: 'string',
              description: 'Cycle description',
            },
            payPeriod: {
              type: 'object',
              properties: {
                startDate: {
                  type: 'string',
                  format: 'date',
                  description: 'Pay period start date',
                },
                endDate: {
                  type: 'string',
                  format: 'date',
                  description: 'Pay period end date',
                },
              },
            },
            payDate: {
              type: 'string',
              format: 'date',
              description: 'Payment date',
            },
            status: {
              type: 'string',
              enum: ['Draft', 'In Progress', 'Completed', 'Cancelled'],
              description: 'Cycle status',
            },
            cycleType: {
              type: 'string',
              enum: ['Monthly', 'Bi-weekly', 'Weekly', 'Custom'],
              description: 'Cycle type',
            },
            totalEmployees: {
              type: 'integer',
              description: 'Total employees in cycle',
            },
            totalGrossPay: {
              type: 'number',
              description: 'Total gross pay',
            },
            totalDeductions: {
              type: 'number',
              description: 'Total deductions',
            },
            totalNetPay: {
              type: 'number',
              description: 'Total net pay',
            },
            currency: {
              type: 'string',
              enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
              description: 'Currency',
            },
          },
        },
        Payslip: {
          type: 'object',
          properties: {
            payslip_id: {
              type: 'integer',
              description: 'Payslip ID',
            },
            employeeDetails: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Employee name',
                },
                employeeId: {
                  type: 'integer',
                  description: 'Employee ID',
                },
                position: {
                  type: 'string',
                  description: 'Position',
                },
                department: {
                  type: 'string',
                  description: 'Department',
                },
              },
            },
            payPeriod: {
              type: 'object',
              properties: {
                startDate: {
                  type: 'string',
                  format: 'date',
                },
                endDate: {
                  type: 'string',
                  format: 'date',
                },
              },
            },
            payDate: {
              type: 'string',
              format: 'date',
              description: 'Payment date',
            },
            earnings: {
              type: 'object',
              properties: {
                basicSalary: {
                  type: 'number',
                  description: 'Basic salary',
                },
                allowances: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                      },
                      amount: {
                        type: 'number',
                      },
                      taxable: {
                        type: 'boolean',
                      },
                    },
                  },
                },
                totalEarnings: {
                  type: 'number',
                  description: 'Total earnings',
                },
              },
            },
            deductions: {
              type: 'object',
              properties: {
                incomeTax: {
                  type: 'number',
                  description: 'Income tax',
                },
                socialSecurity: {
                  type: 'number',
                  description: 'Social security',
                },
                healthInsurance: {
                  type: 'number',
                  description: 'Health insurance',
                },
                totalDeductions: {
                  type: 'number',
                  description: 'Total deductions',
                },
              },
            },
            netPay: {
              type: 'number',
              description: 'Net pay amount',
            },
            status: {
              type: 'string',
              enum: ['Generated', 'Approved', 'Paid', 'Cancelled'],
              description: 'Payslip status',
            },
          },
        },
        AttendanceRecord: {
          type: 'object',
          properties: {
            attendance_id: {
              type: 'integer',
              description: 'Attendance record ID',
            },
            employee_id: {
              type: 'integer',
              description: 'Employee ID',
            },
            clockIn: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Clock in timestamp',
                },
                location: {
                  type: 'object',
                  properties: {
                    latitude: {
                      type: 'number',
                    },
                    longitude: {
                      type: 'number',
                    },
                    address: {
                      type: 'string',
                    },
                  },
                },
                method: {
                  type: 'string',
                  enum: ['Mobile App', 'Web Portal', 'Biometric', 'Card', 'Manual'],
                  description: 'Clock in method',
                },
                notes: {
                  type: 'string',
                  description: 'Clock in notes',
                },
              },
            },
            clockOut: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Clock out timestamp',
                },
                location: {
                  type: 'object',
                  properties: {
                    latitude: {
                      type: 'number',
                    },
                    longitude: {
                      type: 'number',
                    },
                    address: {
                      type: 'string',
                    },
                  },
                },
                method: {
                  type: 'string',
                  enum: ['Mobile App', 'Web Portal', 'Biometric', 'Card', 'Manual'],
                  description: 'Clock out method',
                },
                notes: {
                  type: 'string',
                  description: 'Clock out notes',
                },
              },
            },
            workDate: {
              type: 'string',
              format: 'date',
              description: 'Work date',
            },
            totalHours: {
              type: 'number',
              description: 'Total hours worked',
            },
            regularHours: {
              type: 'number',
              description: 'Regular hours',
            },
            overtimeHours: {
              type: 'number',
              description: 'Overtime hours',
            },
            status: {
              type: 'string',
              enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Holiday', 'Weekend'],
              description: 'Attendance status',
            },
            isApproved: {
              type: 'boolean',
              description: 'Approval status',
            },
          },
        },
        Shift: {
          type: 'object',
          properties: {
            shift_id: {
              type: 'integer',
              description: 'Shift ID',
            },
            name: {
              type: 'string',
              description: 'Shift name',
            },
            description: {
              type: 'string',
              description: 'Shift description',
            },
            startTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Start time (HH:MM)',
            },
            endTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'End time (HH:MM)',
            },
            duration: {
              type: 'number',
              description: 'Shift duration in hours',
            },
            breakDuration: {
              type: 'number',
              description: 'Break duration in minutes',
            },
            workingDays: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              },
              description: 'Working days',
            },
            overtimeRules: {
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean',
                  description: 'Overtime enabled',
                },
                dailyOvertimeThreshold: {
                  type: 'number',
                  description: 'Daily overtime threshold',
                },
                weeklyOvertimeThreshold: {
                  type: 'number',
                  description: 'Weekly overtime threshold',
                },
                overtimeRate: {
                  type: 'number',
                  description: 'Overtime rate multiplier',
                },
                doubleTimeRate: {
                  type: 'number',
                  description: 'Double time rate multiplier',
                },
              },
            },
            isActive: {
              type: 'boolean',
              description: 'Active status',
            },
            isDefault: {
              type: 'boolean',
              description: 'Default shift',
            },
          },
        },
        OvertimeRecord: {
          type: 'object',
          properties: {
            overtime_id: {
              type: 'integer',
              description: 'Overtime record ID',
            },
            employee_id: {
              type: 'integer',
              description: 'Employee ID',
            },
            overtimeDate: {
              type: 'string',
              format: 'date',
              description: 'Overtime date',
            },
            overtimeType: {
              type: 'string',
              enum: ['Daily', 'Weekly', 'Holiday', 'Weekend', 'Emergency'],
              description: 'Overtime type',
            },
            regularHours: {
              type: 'number',
              description: 'Regular hours',
            },
            overtimeHours: {
              type: 'number',
              description: 'Overtime hours',
            },
            doubleTimeHours: {
              type: 'number',
              description: 'Double time hours',
            },
            regularRate: {
              type: 'number',
              description: 'Regular hourly rate',
            },
            overtimeRate: {
              type: 'number',
              description: 'Overtime hourly rate',
            },
            regularPay: {
              type: 'number',
              description: 'Regular pay',
            },
            overtimePay: {
              type: 'number',
              description: 'Overtime pay',
            },
            totalOvertimePay: {
              type: 'number',
              description: 'Total overtime pay',
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
              description: 'Overtime status',
            },
            isApproved: {
              type: 'boolean',
              description: 'Approval status',
            },
            reason: {
              type: 'string',
              description: 'Overtime reason',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            transaction_id: {
              type: 'string',
              description: 'Transaction ID',
            },
            organization_id: {
              type: 'integer',
              description: 'Organization ID',
            },
            type: {
              type: 'string',
              enum: ['Income', 'Expense', 'Transfer', 'Refund'],
              description: 'Transaction type',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount',
            },
            currency: {
              type: 'string',
              enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
              description: 'Currency',
            },
            description: {
              type: 'string',
              description: 'Transaction description',
            },
            category: {
              type: 'string',
              description: 'Transaction category',
            },
            reference: {
              type: 'string',
              description: 'Reference number or ID',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Transaction date',
            },
            account_id: {
              type: 'integer',
              description: 'Account ID',
            },
            vendor_id: {
              type: 'integer',
              description: 'Vendor ID (for expenses)',
            },
            customer_id: {
              type: 'integer',
              description: 'Customer ID (for income)',
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Completed', 'Cancelled', 'Reconciled'],
              description: 'Transaction status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        JobOpening: {
          type: 'object',
          properties: {
            job_id: {
              type: 'string',
              description: 'Job ID',
            },
            organization_id: {
              type: 'integer',
              description: 'Organization ID',
            },
            title: {
              type: 'string',
              description: 'Job title',
            },
            department: {
              type: 'string',
              description: 'Department',
            },
            location: {
              type: 'string',
              description: 'Job location',
            },
            employmentType: {
              type: 'string',
              enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Temporary'],
              description: 'Employment type',
            },
            description: {
              type: 'string',
              description: 'Job description',
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Job requirements',
            },
            responsibilities: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Job responsibilities',
            },
            salary: {
              type: 'object',
              properties: {
                min: {
                  type: 'number',
                },
                max: {
                  type: 'number',
                },
                currency: {
                  type: 'string',
                  enum: ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
                },
              },
            },
            benefits: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Job benefits',
            },
            status: {
              type: 'string',
              enum: ['Open', 'Closed', 'On Hold', 'Draft'],
              description: 'Job status',
            },
            postedDate: {
              type: 'string',
              format: 'date',
              description: 'Date posted',
            },
            applicationDeadline: {
              type: 'string',
              format: 'date',
              description: 'Application deadline',
            },
            totalApplications: {
              type: 'integer',
              description: 'Total number of applications',
            },
          },
        },
        Candidate: {
          type: 'object',
          properties: {
            candidate_id: {
              type: 'string',
              description: 'Candidate ID',
            },
            job_id: {
              type: 'string',
              description: 'Job ID',
            },
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            resume: {
              type: 'string',
              description: 'Resume file path or URL',
            },
            coverLetter: {
              type: 'string',
              description: 'Cover letter',
            },
            experience: {
              type: 'number',
              description: 'Years of experience',
            },
            skills: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Candidate skills',
            },
            education: {
              type: 'string',
              description: 'Education background',
            },
            status: {
              type: 'string',
              enum: ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected', 'Withdrawn'],
              description: 'Candidate status',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Candidate rating',
            },
            notes: {
              type: 'string',
              description: 'Internal notes',
            },
            appliedDate: {
              type: 'string',
              format: 'date',
              description: 'Application date',
            },
            lastContactDate: {
              type: 'string',
              format: 'date',
              description: 'Last contact date',
            },
            interviews: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  interview_id: {
                    type: 'string',
                  },
                  interviewDate: {
                    type: 'string',
                    format: 'date-time',
                  },
                  interviewType: {
                    type: 'string',
                    enum: ['Phone', 'Video', 'In-person', 'Technical', 'HR', 'Final'],
                  },
                  interviewer: {
                    type: 'string',
                  },
                  feedback: {
                    type: 'string',
                  },
                  rating: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 5,
                  },
                },
              },
            },
          },
        },
        Role: {
          type: 'object',
          properties: {
            roleName: {
              type: 'string',
              enum: ['Super Admin', 'Client Admin', 'HR Account Manager', 'Employee', 'Payroll Specialist', 'Bookkeeping', 'Recruitment Specialist', 'Leave Specialist', 'Department Specialist'],
              description: 'Role name',
            },
            description: {
              type: 'string',
              description: 'Role description',
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of permissions',
            },
            accessRules: {
              type: 'object',
              properties: {
                modules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      module: {
                        type: 'string',
                        enum: ['auth', 'user', 'role', 'organization', 'employee', 'payroll', 'attendance', 'finance', 'recruitment', 'leave', 'department'],
                      },
                      access: {
                        type: 'string',
                        enum: ['read', 'write', 'admin', 'none'],
                      },
                      restrictions: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
            isActive: {
              type: 'boolean',
              description: 'Role active status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './modules/auth/auth.routes.js',
    './modules/user/user.routes.js',
    './modules/role/role.routes.js',
    './modules/organization/organization.routes.js',
    './modules/employee/employee.routes.js',
    './modules/payroll/payroll.routes.js',
    './modules/attendance/attendance.routes.js',
    './modules/finance/finance.routes.js',
    './modules/recruitment/recruitment.routes.js',      
    './modules/leave/leave.routes.js',
    './modules/department/department.routes.js',
  ],
};

const specs = swaggerJSDoc(options);

module.exports = specs;
