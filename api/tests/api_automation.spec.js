/**
 * eCareHealth AI API Test Suite
 * Comprehensive test automation for healthcare appointment booking workflow
 * 
 * @description Tests the complete flow: Login → Create Provider → Set Availability → Create Patient → Book Appointment
 * @author API Test Automation
 * @version 1.0.0
 * @date 2025-07-25
 */

class ECareHealthAPITester {
    constructor() {
        this.baseURL = 'https://stage-api.ecarehealth.com';
        this.tenantId = 'stage_aithinkitive';
        this.accessToken = null;
        this.testResults = {
            testName: "eCareHealth AI API Test Suite",
            startTime: new Date().toISOString(),
            tests: [],
            summary: { passed: 0, failed: 0, total: 0 },
            endTime: null,
            duration: null
        };
        
        // Test data storage
        this.providerData = null;
        this.providerUuid = null;
        this.patientData = null;
        this.patientUuid = null;
    }

    /**
     * Generate timestamp for unique identifiers
     */
    generateTimestamp() {
        return Date.now();
    }

    /**
     * Log test results
     */
    log(message) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    /**
     * Add test result to collection
     */
    addTestResult(testName, status, statusCode, expectedStatus, response, error = null, additionalData = {}) {
        const testResult = {
            testName,
            status,
            statusCode,
            expectedStatus,
            response,
            timestamp: new Date().toISOString(),
            ...additionalData
        };
        
        if (error) {
            testResult.error = error;
        }
        
        this.testResults.tests.push(testResult);
        
        if (status === "PASSED") {
            this.testResults.summary.passed++;
            this.log(`✅ ${testName} - PASSED`);
        } else {
            this.testResults.summary.failed++;
            this.log(`❌ ${testName} - FAILED: ${error || 'Unknown error'}`);
        }
        
        this.testResults.summary.total++;
    }

    /**
     * Make HTTP request with error handling
     */
    async makeRequest(url, method = 'GET', body = null, additionalHeaders = {}) {
        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'X-TENANT-ID': this.tenantId,
            ...additionalHeaders
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const config = {
            method,
            headers
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return { response, data };
        } catch (error) {
            throw new Error(`Network error: ${error.message}`);
        }
    }

    /**
     * Test 1: Provider Login & Authentication
     */
    async testProviderLogin() {
        this.log("=== Test 1: Provider Login ===");
        
        try {
            const loginData = {
                username: "rose.gomez@jourrapide.com",
                password: "Pass@123",
                xTENANTID: this.tenantId
            };

            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/login`,
                'POST',
                loginData
            );

            if (response.status === 200 && data.data && data.data.access_token) {
                this.accessToken = data.data.access_token;
                this.addTestResult(
                    "Provider Login",
                    "PASSED",
                    response.status,
                    200,
                    data,
                    null,
                    { accessToken: "Retrieved successfully" }
                );
                return true;
            } else {
                this.addTestResult(
                    "Provider Login",
                    "FAILED",
                    response.status,
                    200,
                    data,
                    "Login failed or no access token received"
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Provider Login",
                "FAILED",
                0,
                200,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Test 2: Create Provider with optimized data
     */
    async testCreateProvider() {
        this.log("=== Test 2: Create Provider ===");
        
        try {
            const timestamp = this.generateTimestamp();
            this.providerData = {
                roleType: "PROVIDER",
                active: false,
                admin_access: true,
                status: false,
                avatar: "",
                role: "PROVIDER",
                firstName: "Michael",
                lastName: "Thompson",
                gender: "MALE",
                phone: "",
                npi: "",
                specialities: null,
                groupNpiNumber: "",
                licensedStates: null,
                licenseNumber: "",
                acceptedInsurances: null,
                experience: "",
                taxonomyNumber: "",
                workLocations: null,
                email: `michael.thompson${timestamp}@testmedical.com`,
                officeFaxNumber: "",
                areaFocus: "",
                hospitalAffiliation: "",
                ageGroupSeen: null,
                spokenLanguages: null,
                providerEmployment: "",
                insurance_verification: "",
                prior_authorization: "",
                secondOpinion: "",
                careService: null,
                bio: "",
                expertise: "",
                workExperience: "",
                licenceInformation: [{ uuid: "", licenseState: "", licenseNumber: "" }],
                deaInformation: [{ deaState: "", deaNumber: "", deaTermDate: "", deaActiveDate: "" }]
            };

            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/provider`,
                'POST',
                this.providerData
            );

            const expectedMessage = "Provider created successfully.";
            if (response.status === 201 && data.message === expectedMessage) {
                this.addTestResult(
                    "Create Provider",
                    "PASSED",
                    response.status,
                    201,
                    data,
                    null,
                    { testData: this.providerData }
                );
                return true;
            } else {
                this.addTestResult(
                    "Create Provider",
                    "FAILED",
                    response.status,
                    201,
                    data,
                    `Expected: "${expectedMessage}", Got: "${data.message}"`
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Create Provider",
                "FAILED",
                0,
                201,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Test 3: Get Provider Details and extract UUID
     */
    async testGetProviderDetails() {
        this.log("=== Test 3: Get Provider Details ===");
        
        try {
            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/provider?page=0&size=20`
            );

            let providerFound = false;
            if (response.status === 200 && data.data && data.data.content) {
                const createdProvider = data.data.content.find(provider => 
                    provider.firstName === this.providerData.firstName && 
                    provider.lastName === this.providerData.lastName
                );
                
                if (createdProvider) {
                    providerFound = true;
                    this.providerUuid = createdProvider.uuid;
                    this.log(`Provider UUID extracted: ${this.providerUuid}`);
                }
            }

            if (response.status === 200 && providerFound) {
                this.addTestResult(
                    "Get Provider Details",
                    "PASSED",
                    response.status,
                    200,
                    data,
                    null,
                    { providerFound: true, providerUuid: this.providerUuid }
                );
                return true;
            } else {
                this.addTestResult(
                    "Get Provider Details",
                    "FAILED",
                    response.status,
                    200,
                    data,
                    providerFound ? "Unexpected status code" : "Provider not found in response"
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Get Provider Details",
                "FAILED",
                0,
                200,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Test 4: Set Provider Availability
     */
    async testSetAvailability() {
        this.log("=== Test 4: Set Provider Availability ===");
        
        try {
            const availabilityData = {
                setToWeekdays: false,
                providerId: this.providerUuid,
                bookingWindow: "3",
                timezone: "EST",
                bufferTime: 0,
                initialConsultTime: 0,
                followupConsultTime: 0,
                settings: [
                    {
                        type: "NEW",
                        slotTime: "30",
                        minNoticeUnit: "8_HOUR"
                    }
                ],
                blockDays: [],
                daySlots: [
                    {
                        day: "MONDAY",
                        startTime: "10:00:00",
                        endTime: "12:00:00",
                        availabilityMode: "VIRTUAL"
                    },
                    {
                        day: "TUESDAY",
                        startTime: "10:00:00",
                        endTime: "12:00:00",
                        availabilityMode: "VIRTUAL"
                    }
                ],
                bookBefore: "undefined undefined",
                xTENANTID: this.tenantId
            };

            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/provider/availability-setting`,
                'POST',
                availabilityData
            );

            const expectedMessage = `Availability added successfully for provider ${this.providerData.firstName} ${this.providerData.lastName}`;
            if (response.status === 200 && data.message === expectedMessage) {
                this.addTestResult(
                    "Set Provider Availability",
                    "PASSED",
                    response.status,
                    200,
                    data,
                    null,
                    { availabilityData }
                );
                return true;
            } else {
                this.addTestResult(
                    "Set Provider Availability",
                    "FAILED",
                    response.status,
                    200,
                    data,
                    `Expected: "${expectedMessage}", Got: "${data.message}"`
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Set Provider Availability",
                "FAILED",
                0,
                200,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Test 5: Create Patient with optimized data
     */
    async testCreatePatient() {
        this.log("=== Test 5: Create Patient ===");
        
        try {
            this.patientData = {
                phoneNotAvailable: true,
                emailNotAvailable: true,
                registrationDate: "",
                firstName: "Jessica",
                middleName: "",
                lastName: "Williams",
                timezone: "IST",
                birthDate: "1990-05-15T18:30:00.000Z",
                gender: "FEMALE",
                ssn: "",
                mrn: "",
                languages: null,
                avatar: "",
                mobileNumber: "",
                faxNumber: "",
                homePhone: "",
                address: {
                    line1: "",
                    line2: "",
                    city: "",
                    state: "",
                    country: "",
                    zipcode: ""
                },
                emergencyContacts: [
                    {
                        firstName: "",
                        lastName: "",
                        mobile: ""
                    }
                ],
                patientInsurances: [
                    {
                        active: true,
                        insuranceId: "",
                        copayType: "FIXED",
                        coInsurance: "",
                        claimNumber: "",
                        note: "",
                        deductibleAmount: "",
                        employerName: "",
                        employerAddress: {
                            line1: "",
                            line2: "",
                            city: "",
                            state: "",
                            country: "",
                            zipcode: ""
                        },
                        subscriberFirstName: "",
                        subscriberLastName: "",
                        subscriberMiddleName: "",
                        subscriberSsn: "",
                        subscriberMobileNumber: "",
                        subscriberAddress: {
                            line1: "",
                            line2: "",
                            city: "",
                            state: "",
                            country: "",
                            zipcode: ""
                        },
                        groupId: "",
                        memberId: "",
                        groupName: "",
                        frontPhoto: "",
                        backPhoto: "",
                        insuredFirstName: "",
                        insuredLastName: "",
                        address: {
                            line1: "",
                            line2: "",
                            city: "",
                            state: "",
                            country: "",
                            zipcode: ""
                        },
                        insuredBirthDate: "",
                        coPay: "",
                        insurancePayer: {}
                    }
                ],
                emailConsent: false,
                messageConsent: false,
                callConsent: false,
                patientConsentEntities: [
                    {
                        signedDate: "2025-07-24T08:07:34.316Z"
                    }
                ]
            };

            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/patient`,
                'POST',
                this.patientData
            );

            const expectedMessage = "Patient Details Added Successfully.";
            if (response.status === 201 && data.message === expectedMessage) {
                this.addTestResult(
                    "Create Patient",
                    "PASSED",
                    response.status,
                    201,
                    data,
                    null,
                    { testData: this.patientData }
                );
                return true;
            } else {
                this.addTestResult(
                    "Create Patient",
                    "FAILED",
                    response.status,
                    201,
                    data,
                    `Expected: "${expectedMessage}", Got: "${data.message}"`
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Create Patient",
                "FAILED",
                0,
                201,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Test 6: Get Patient Details and extract UUID
     */
    async testGetPatientDetails() {
        this.log("=== Test 6: Get Patient Details ===");
        
        try {
            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/patient?page=0&size=20&searchString=`
            );

            let patientFound = false;
            if (response.status === 200 && data.data && data.data.content) {
                const createdPatient = data.data.content.find(patient => 
                    patient.firstName === this.patientData.firstName && 
                    patient.lastName === this.patientData.lastName
                );
                
                if (createdPatient) {
                    patientFound = true;
                    this.patientUuid = createdPatient.uuid;
                    this.log(`Patient UUID extracted: ${this.patientUuid}`);
                }
            }

            if (response.status === 200 && patientFound) {
                this.addTestResult(
                    "Get Patient Details",
                    "PASSED",
                    response.status,
                    200,
                    data,
                    null,
                    { patientFound: true, patientUuid: this.patientUuid }
                );
                return true;
            } else {
                this.addTestResult(
                    "Get Patient Details",
                    "FAILED",
                    response.status,
                    200,
                    data,
                    patientFound ? "Unexpected status code" : "Patient not found in response"
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Get Patient Details",
                "FAILED",
                0,
                200,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Test 7: Book Appointment with optimal timing
     */
    async testBookAppointment() {
        this.log("=== Test 7: Book Appointment ===");
        
        try {
            // Calculate next Monday 10:00 AM EST (15:00 UTC) to match availability
            const now = new Date();
            const nextMonday = new Date();
            nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
            if (nextMonday <= now) {
                nextMonday.setDate(nextMonday.getDate() + 7);
            }
            
            // Set time to 10:00 AM EST (which is 15:00 UTC)
            const startTime = new Date(nextMonday);
            startTime.setUTCHours(15, 0, 0, 0); // 10:00 AM EST = 15:00 UTC
            const endTime = new Date(startTime);
            endTime.setUTCMinutes(30); // 30 minutes later
            
            const appointmentData = {
                mode: "VIRTUAL",
                patientId: this.patientUuid,
                customForms: null,
                visit_type: "",
                type: "NEW",
                paymentType: "CASH",
                providerId: this.providerUuid,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                insurance_type: "",
                note: "",
                authorization: "",
                forms: [],
                chiefComplaint: "API test appointment - automated booking",
                isRecurring: false,
                recurringFrequency: "daily",
                reminder_set: false,
                endType: "never",
                endDate: "2025-07-24T08:07:34.318Z",
                endAfter: 5,
                customFrequency: 1,
                customFrequencyUnit: "days",
                selectedWeekdays: [],
                reminder_before_number: 1,
                timezone: "EST",
                duration: 30,
                xTENANTID: this.tenantId
            };

            this.log(`Scheduling appointment for: ${startTime.toISOString()} to ${endTime.toISOString()}`);

            const { response, data } = await this.makeRequest(
                `${this.baseURL}/api/master/appointment`,
                'POST',
                appointmentData
            );

            const expectedMessage = "Appointment booked successfully.";
            if (response.status === 201 && data.message === expectedMessage) {
                this.addTestResult(
                    "Book Appointment",
                    "PASSED",
                    response.status,
                    201,
                    data,
                    null,
                    { 
                        appointmentData,
                        scheduledTime: startTime.toISOString(),
                        duration: "30 minutes"
                    }
                );
                return true;
            } else {
                this.addTestResult(
                    "Book Appointment",
                    "FAILED",
                    response.status,
                    201,
                    data,
                    `Expected: "${expectedMessage}", Got: "${data.message}"`
                );
                return false;
            }
        } catch (error) {
            this.addTestResult(
                "Book Appointment",
                "FAILED",
                0,
                201,
                null,
                error.message
            );
            return false;
        }
    }

    /**
     * Run all tests in sequence
     */
    async runAllTests() {
        this.log("🚀 Starting eCareHealth API Test Suite");
        this.log("==========================================");
        
        const testSequence = [
            () => this.testProviderLogin(),
            () => this.testCreateProvider(),
            () => this.testGetProviderDetails(),
            () => this.testSetAvailability(),
            () => this.testCreatePatient(),
            () => this.testGetPatientDetails(),
            () => this.testBookAppointment()
        ];

        let allPassed = true;

        for (const test of testSequence) {
            const result = await test();
            if (!result) {
                allPassed = false;
                // Continue with remaining tests even if one fails
            }
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Finalize results
        this.testResults.endTime = new Date().toISOString();
        this.testResults.duration = (new Date(this.testResults.endTime) - new Date(this.testResults.startTime)) / 1000;

        this.generateReport();
        return allPassed;
    }

    /**
     * Generate comprehensive test report
     */
    generateReport() {
        this.log("\n📊 TEST EXECUTION REPORT");
        this.log("========================");
        this.log(`Test Suite: ${this.testResults.testName}`);
        this.log(`Start Time: ${this.testResults.startTime}`);
        this.log(`End Time: ${this.testResults.endTime}`);
        this.log(`Duration: ${this.testResults.duration} seconds`);
        this.log(`Total Tests: ${this.testResults.summary.total}`);
        this.log(`Passed: ${this.testResults.summary.passed}`);
        this.log(`Failed: ${this.testResults.summary.failed}`);
        this.log(`Pass Rate: ${((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1)}%`);
        
        this.log("\n📋 DETAILED RESULTS:");
        this.log("===================");
        
        this.testResults.tests.forEach((test, index) => {
            const status = test.status === "PASSED" ? "✅" : "❌";
            this.log(`${index + 1}. ${status} ${test.testName}`);
            this.log(`   Status Code: ${test.statusCode} (Expected: ${test.expectedStatus})`);
            if (test.error) {
                this.log(`   Error: ${test.error}`);
            }
            if (test.providerUuid) {
                this.log(`   Provider UUID: ${test.providerUuid}`);
            }
            if (test.patientUuid) {
                this.log(`   Patient UUID: ${test.patientUuid}`);
            }
            if (test.scheduledTime) {
                this.log(`   Appointment Time: ${test.scheduledTime}`);
            }
            this.log("");
        });

        if (this.testResults.summary.failed === 0) {
            this.log("🎉 ALL TESTS PASSED! API is working perfectly!");
        } else {
            this.log("⚠️  Some tests failed. Please review the errors above.");
        }

        // Return results for programmatic access
        return this.testResults;
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        return JSON.stringify(this.testResults, null, 2);
    }
}

// Usage Examples:

/**
 * Example 1: Basic usage
 */
async function runBasicTest() {
    const tester = new ECareHealthAPITester();
    const success = await tester.runAllTests();
    console.log(`Test execution ${success ? 'succeeded' : 'failed'}`);
}

/**
 * Example 2: Individual test execution
 */
async function runIndividualTests() {
    const tester = new ECareHealthAPITester();
    
    // Run tests individually with custom logic
    const loginSuccess = await tester.testProviderLogin();
    if (loginSuccess) {
        await tester.testCreateProvider();
        await tester.testGetProviderDetails();
        // ... continue with other tests
    }
    
    tester.generateReport();
}

/**
 * Example 3: Custom configuration
 */
async function runCustomTest() {
    const tester = new ECareHealthAPITester();
    
    // Override default configuration if needed
    tester.baseURL = 'https://your-custom-api.com';
    tester.tenantId = 'your-tenant-id';
    
    const results = await tester.runAllTests();
    
    // Export results to file or send to monitoring system
    const jsonResults = tester.exportResults();
    console.log("Exported results:", jsonResults);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ECareHealthAPITester;
}

// Auto-run if called directly (uncomment the line below to auto-execute)
// runBasicTest().catch(console.error);