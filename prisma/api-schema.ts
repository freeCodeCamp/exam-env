export interface paths {
    "/coderoad-challenge-completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header: {
                    "coderoad-user-token": string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        tutorialId: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "success";
                            msg: string;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            msg: string;
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/project-completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: objectid */
                        id: string;
                        challengeType?: number;
                        solution: string;
                        githubLink?: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            completedDate: number;
                            points: number;
                            alreadyCompleted: boolean;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            message: "That does not appear to be a valid challenge submission." | "You have not provided the valid links for us to inspect your work.";
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            message: "You have to complete the project before you can submit a URL." | "That does not appear to be a valid challenge submission.";
                        } | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backend-challenge-completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: objectid */
                        id: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            completedDate: number;
                            points: number;
                            alreadyCompleted: boolean;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "That does not appear to be a valid challenge submission.";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/modern-challenge-completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: objectid */
                        id: string;
                        challengeType: number;
                        files?: {
                            contents: string;
                            key: string;
                            ext: string;
                            name: string;
                            history: string[];
                        }[];
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            completedDate: number;
                            points: number;
                            alreadyCompleted: boolean;
                            savedChallenges: {
                                id: string;
                                files: {
                                    contents: string;
                                    key: string;
                                    ext: string;
                                    name: string;
                                    history: string[];
                                }[];
                                lastSavedDate: number;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "That does not appear to be a valid challenge submission.";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/save-challenge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: objectid */
                        id: string;
                        files: {
                            contents: string;
                            key: string;
                            ext: string;
                            name: string;
                            history: string[];
                        }[];
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            savedChallenges: {
                                id: string;
                                files: {
                                    contents: string;
                                    key: string;
                                    ext: string;
                                    name: string;
                                    history: string[];
                                }[];
                                lastSavedDate: number;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "That does not appear to be a valid challenge submission.";
                            /** @enum {string} */
                            type: "error";
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": "That challenge type is not saveable." | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            generatedExam: {
                                id: string;
                                question: string;
                                answers: {
                                    id: string;
                                    answer: string;
                                }[];
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        } | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ms-trophy-challenge-completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: objectid */
                        id: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            completedDate: number;
                            points: number;
                            alreadyCompleted: boolean;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.trophy.err-2";
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.trophy.err-1";
                        } | {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.trophy.err-3";
                        } | {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.trophy.err-4";
                            variables: {
                                msUsername: string;
                            };
                        } | {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.trophy.err-6";
                        } | {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.profile.err";
                            variables: {
                                msUsername: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.trophy.err-5";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam-challenge-completed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: objectid */
                        id: string;
                        challengeType: number;
                        userCompletedExam: {
                            examTimeInSeconds: number;
                            userExamQuestions: {
                                id: string;
                                question: string;
                                answer: {
                                    id: string;
                                    answer: string;
                                };
                            }[];
                        };
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            completedDate: number;
                            points: number;
                            alreadyCompleted: boolean;
                            examResults: {
                                numberOfCorrectAnswers: number;
                                numberOfQuestionsInExam: number;
                                percentCorrect: number;
                                passingPercent: number;
                                passed: boolean;
                                examTimeInSeconds: number;
                            };
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        } | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/donate/update-stripe-card": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": Record<string, never>;
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            sessionId: string;
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/donate/add-donation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": Record<string, never>;
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            isDonating: boolean;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "User is already donating.";
                            /** @enum {string} */
                            type: "info";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "Something went wrong.";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/donate/charge-stripe-card": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        paymentMethodId: string;
                        amount: number;
                        /** @enum {string} */
                        duration: "month";
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            isDonating: boolean;
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                message: string;
                                type: "AlreadyDonatingError" | "MethodRestrictionError";
                            };
                        };
                    };
                };
                /** @description Default Response */
                402: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            error: {
                                message: string;
                                type: "UserActionRequired" | "PaymentMethodRequired";
                                client_secret?: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            error: "Donation failed due to a server error.";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/certificate/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        certSlug: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            response: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.already-claimed";
                                variables: {
                                    name: string;
                                };
                            } | {
                                /** @enum {string} */
                                type: "success";
                                /** @enum {string} */
                                message: "flash.cert-claim-success";
                                variables: {
                                    username: string;
                                    name: string;
                                };
                            };
                            isCertMap: {
                                isRespWebDesignCert: boolean;
                                isJsAlgoDataStructCert: boolean;
                                isFrontEndLibsCert: boolean;
                                is2018DataVisCert: boolean;
                                isApisMicroservicesCert: boolean;
                                isInfosecQaCert: boolean;
                                isQaCertV7: boolean;
                                isInfosecCertV7: boolean;
                                isFrontEndCert: boolean;
                                isBackEndCert: boolean;
                                isDataVisCert: boolean;
                                isFullStackCert: boolean;
                                isSciCompPyCertV7: boolean;
                                isDataAnalysisPyCertV7: boolean;
                                isMachineLearningPyCertV7: boolean;
                                isRelationalDatabaseCertV8: boolean;
                                isCollegeAlgebraPyCertV8: boolean;
                                isFoundationalCSharpCertV8: boolean;
                            };
                            completedChallenges: {
                                id: string;
                                completedDate: number;
                                solution?: string;
                                githubLink?: string;
                                challengeType?: number;
                                files: {
                                    contents: string;
                                    key: string;
                                    ext: string;
                                    name: string;
                                    path?: string;
                                }[];
                                isManuallyApproved?: boolean;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            response: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.incomplete-steps";
                                variables: {
                                    name: string;
                                };
                            };
                            isCertMap: {
                                isRespWebDesignCert: boolean;
                                isJsAlgoDataStructCert: boolean;
                                isFrontEndLibsCert: boolean;
                                is2018DataVisCert: boolean;
                                isApisMicroservicesCert: boolean;
                                isInfosecQaCert: boolean;
                                isQaCertV7: boolean;
                                isInfosecCertV7: boolean;
                                isFrontEndCert: boolean;
                                isBackEndCert: boolean;
                                isDataVisCert: boolean;
                                isFullStackCert: boolean;
                                isSciCompPyCertV7: boolean;
                                isDataAnalysisPyCertV7: boolean;
                                isMachineLearningPyCertV7: boolean;
                                isRelationalDatabaseCertV8: boolean;
                                isCollegeAlgebraPyCertV8: boolean;
                                isFoundationalCSharpCertV8: boolean;
                            };
                            completedChallenges: {
                                id: string;
                                completedDate: number;
                                solution?: string;
                                githubLink?: string;
                                challengeType?: number;
                                files: {
                                    contents: string;
                                    key: string;
                                    ext: string;
                                    name: string;
                                    path?: string;
                                }[];
                                isManuallyApproved?: boolean;
                            }[];
                        } | {
                            response: {
                                /** @enum {string} */
                                type: "danger";
                                /** @enum {string} */
                                message: "flash.wrong-name";
                                variables: {
                                    name: string;
                                };
                            };
                        } | {
                            response: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.name-needed";
                            };
                            isCertMap: {
                                isRespWebDesignCert: boolean;
                                isJsAlgoDataStructCert: boolean;
                                isFrontEndLibsCert: boolean;
                                is2018DataVisCert: boolean;
                                isApisMicroservicesCert: boolean;
                                isInfosecQaCert: boolean;
                                isQaCertV7: boolean;
                                isInfosecCertV7: boolean;
                                isFrontEndCert: boolean;
                                isBackEndCert: boolean;
                                isDataVisCert: boolean;
                                isFullStackCert: boolean;
                                isSciCompPyCertV7: boolean;
                                isDataAnalysisPyCertV7: boolean;
                                isMachineLearningPyCertV7: boolean;
                                isRelationalDatabaseCertV8: boolean;
                                isCollegeAlgebraPyCertV8: boolean;
                                isFoundationalCSharpCertV8: boolean;
                            };
                            completedChallenges: {
                                id: string;
                                completedDate: number;
                                solution?: string;
                                githubLink?: string;
                                challengeType?: number;
                                files: {
                                    contents: string;
                                    key: string;
                                    ext: string;
                                    name: string;
                                    path?: string;
                                }[];
                                isManuallyApproved?: boolean;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "danger";
                            /** @enum {string} */
                            message: "flash.went-wrong";
                        } | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-profileui": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        profileUI: {
                            isLocked: boolean;
                            showAbout: boolean;
                            showCerts: boolean;
                            showDonation: boolean;
                            showHeatMap: boolean;
                            showLocation: boolean;
                            showName: boolean;
                            showPoints: boolean;
                            showPortfolio: boolean;
                            showTimeLine: boolean;
                        };
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.privacy-updated";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** Format: email */
                        email: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "Check your email and click the link we sent you to confirm your new email address.";
                            /** @enum {string} */
                            type: "info";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            type: "danger" | "info";
                        };
                    };
                };
                /** @description Default Response */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            /** @enum {string} */
                            type: "info";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-theme": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        theme: "default" | "night";
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.updated-themes";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-socials": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        website: "" | string;
                        twitter: "" | string;
                        githubProfile: "" | string;
                        linkedin: "" | string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.updated-socials";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-username": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            /** @enum {string} */
                            type: "success";
                            variables: {
                                username: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message?: string;
                            /** @enum {string} */
                            type: "info";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: string;
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-about": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        about?: string;
                        name?: string;
                        picture?: string;
                        location?: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.updated-about-me";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-keyboard-shortcuts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        keyboardShortcuts: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.keyboard-shortcut-updated";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-quincy-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        sendQuincyEmail: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.subscribe-to-quincy-updated";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-honesty": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @enum {boolean} */
                        isHonest: true;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "buttons.accepted-honesty";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-privacy-terms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        quincyEmails: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.privacy-updated";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-portfolio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        portfolio: {
                            description?: string;
                            id?: string;
                            image?: string;
                            title?: string;
                            url?: string;
                        }[];
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.portfolio-item-updated";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update-my-classroom-mode": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        isClassroomAccount: boolean;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.classroom-mode-updated";
                            /** @enum {string} */
                            type: "success";
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.wrong-updating";
                            /** @enum {string} */
                            type: "danger";
                        } | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/delete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": Record<string, never>;
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/reset-progress": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": Record<string, never>;
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/user-token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            userToken: null;
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "userToken not found";
                            /** @enum {string} */
                            type: "info";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/report-user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        username: string;
                        reportDescription: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "info";
                            /** @enum {string} */
                            message: "flash.report-sent";
                            variables: {
                                email: string;
                            };
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "danger";
                            /** @enum {string} */
                            message: "flash.provide-username";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/ms-username": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        msTranscriptUrl: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            msUsername: string;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.transcript.link-err-1";
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.transcript.link-err-4";
                        } | {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.transcript.link-err-2";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.transcript.link-err-6";
                        } | {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.ms.transcript.link-err-3";
                        };
                    };
                };
            };
        };
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            msUsername: null;
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.ms.transcript.unlink-err";
                            /** @enum {string} */
                            type: "error";
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/submit-survey": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        surveyResults: {
                            /** @enum {string} */
                            title: "Foundational C# with Microsoft Survey";
                            responses: {
                                question: string;
                                response: string;
                            }[];
                        };
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "success";
                            /** @enum {string} */
                            message: "flash.survey.success";
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.survey.err-1";
                        } | {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.survey.err-2";
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            type: "error";
                            /** @enum {string} */
                            message: "flash.survey.err-3";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/exam-environment/token": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            examEnvironmentAuthorizationToken: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user/get-session-user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            user: {
                                [key: string]: {
                                    about: string;
                                    acceptedPrivacyTerms: boolean;
                                    calendar: {
                                        [key: string]: 1;
                                    };
                                    completedChallenges: {
                                        id: string;
                                        completedDate: number;
                                        solution?: string;
                                        githubLink?: string;
                                        challengeType?: number;
                                        files: {
                                            contents: string;
                                            key: string;
                                            ext: string;
                                            name: string;
                                            path?: string;
                                        }[];
                                        isManuallyApproved?: boolean;
                                        examResults?: {
                                            numberOfCorrectAnswers: number;
                                            numberOfQuestionsInExam: number;
                                            percentCorrect: number;
                                            passingPercent: number;
                                            passed: boolean;
                                            examTimeInSeconds: number;
                                        };
                                    }[];
                                    completedExams: {
                                        id: string;
                                        completedDate: number;
                                        challengeType?: number;
                                        examResults: {
                                            numberOfCorrectAnswers: number;
                                            numberOfQuestionsInExam: number;
                                            percentCorrect: number;
                                            passingPercent: number;
                                            passed: boolean;
                                            examTimeInSeconds: number;
                                        };
                                    }[];
                                    completedChallengeCount: number;
                                    currentChallengeId: string;
                                    email: string;
                                    emailVerified: boolean;
                                    githubProfile?: string;
                                    id: string;
                                    is2018DataVisCert: boolean;
                                    is2018FullStackCert: boolean;
                                    isApisMicroservicesCert: boolean;
                                    isBackEndCert: boolean;
                                    isCheater: boolean;
                                    isCollegeAlgebraPyCertV8: boolean;
                                    isDataAnalysisPyCertV7: boolean;
                                    isDataVisCert: boolean;
                                    isDonating: boolean;
                                    isFoundationalCSharpCertV8: boolean;
                                    isFrontEndCert: boolean;
                                    isFrontEndLibsCert: boolean;
                                    isFullStackCert: boolean;
                                    isHonest: boolean;
                                    isInfosecCertV7: boolean;
                                    isInfosecQaCert: boolean;
                                    isJsAlgoDataStructCert: boolean;
                                    isJsAlgoDataStructCertV8: boolean;
                                    isMachineLearningPyCertV7: boolean;
                                    isQaCertV7: boolean;
                                    isRelationalDatabaseCertV8: boolean;
                                    isRespWebDesignCert: boolean;
                                    isSciCompPyCertV7: boolean;
                                    keyboardShortcuts: boolean;
                                    linkedin?: string;
                                    location: string;
                                    name: string;
                                    partiallyCompletedChallenges: {
                                        id: string;
                                        completedDate: number;
                                    }[];
                                    picture: string;
                                    points: number;
                                    portfolio: {
                                        description: string;
                                        id: string;
                                        image: string;
                                        title: string;
                                        url: string;
                                    }[];
                                    profileUI?: {
                                        isLocked?: boolean;
                                        showAbout?: boolean;
                                        showCerts?: boolean;
                                        showDonation?: boolean;
                                        showHeatMap?: boolean;
                                        showLocation?: boolean;
                                        showName?: boolean;
                                        showPoints?: boolean;
                                        showPortfolio?: boolean;
                                        showTimeLine?: boolean;
                                    };
                                    sendQuincyEmail: boolean;
                                    theme: string;
                                    twitter?: string;
                                    website?: string;
                                    yearsTopContributor: string[];
                                    isEmailVerified: boolean;
                                    joinDate: string;
                                    savedChallenges?: {
                                        id: string;
                                        files: {
                                            contents: string;
                                            key: string;
                                            ext: string;
                                            name: string;
                                            history: string[];
                                        }[];
                                        lastSavedDate: number;
                                    }[];
                                    username: string;
                                    userToken?: string;
                                    completedSurveys: {
                                        title: string;
                                        responses: {
                                            question: string;
                                            response: string;
                                        }[];
                                    }[];
                                    msUsername?: string;
                                };
                            };
                            result: string;
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            user: Record<string, never>;
                            /** @enum {string} */
                            result: "";
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/confirm-email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    email: string;
                    token: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/mobile-login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/signin": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam-environment/exams": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header: {
                    "exam-environment-authorization-token": string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            exams: {
                                id: string;
                                config: {
                                    name: string;
                                    note: string;
                                    totalTimeInMS: number;
                                    retakeTimeInMS: number;
                                };
                                canTake: boolean;
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam-environment/exam/generated-exam": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header: {
                    "exam-environment-authorization-token": string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        examId: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            exam: {
                                [key: string]: unknown;
                            };
                            examAttempt: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam-environment/exam/attempt": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header: {
                    "exam-environment-authorization-token": string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        attempt: {
                            examId: string;
                            questionSets: {
                                id: string;
                                questions: {
                                    id: string;
                                    answers: string[];
                                }[];
                            }[];
                        };
                    };
                };
            };
            responses: {
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam-environment/screenshot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: never;
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/exam-environment/token-meta": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header: {
                    "exam-environment-authorization-token": string;
                };
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** Format: date-time */
                            expireAt: string;
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
                /** @description Default Response */
                418: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            code: string;
                            message: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/donate/create-stripe-payment-intent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        amount: number;
                        /** @enum {string} */
                        duration: "month";
                        /** Format: email */
                        email: string;
                        name: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            subscriptionId: string;
                            clientSecret: string;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            error: "The donation form had invalid values for this submission.";
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            error: "Donation failed due to a server error.";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/donate/charge-stripe": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        amount: number;
                        /** @enum {string} */
                        duration: "month";
                        /** Format: email */
                        email: string;
                        subscriptionId: string;
                    };
                };
            };
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            isDonating: boolean;
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            error: "Donation failed due to a server error.";
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/signout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ue/{unsubscribeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    unsubscribeId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/resubscribe/{unsubscribeId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    unsubscribeId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/get-public-profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    username: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            entities: {
                                user: {
                                    [key: string]: {
                                        isLocked: boolean;
                                        profileUI: {
                                            isLocked?: boolean;
                                            showAbout?: boolean;
                                            showCerts?: boolean;
                                            showDonation?: boolean;
                                            showHeatMap?: boolean;
                                            showLocation?: boolean;
                                            showName?: boolean;
                                            showPoints?: boolean;
                                            showPortfolio?: boolean;
                                            showTimeLine?: boolean;
                                        };
                                        username: string;
                                    } | {
                                        about: string;
                                        calendar: {
                                            [key: string]: 1;
                                        };
                                        completedChallenges: {
                                            id: string;
                                            completedDate: number;
                                            solution?: string;
                                            githubLink?: string;
                                            challengeType?: number;
                                            files: {
                                                contents: string;
                                                key: string;
                                                ext: string;
                                                name: string;
                                                path?: string;
                                            }[];
                                            isManuallyApproved?: boolean;
                                            examResults?: {
                                                numberOfCorrectAnswers: number;
                                                numberOfQuestionsInExam: number;
                                                percentCorrect: number;
                                                passingPercent: number;
                                                passed: boolean;
                                                examTimeInSeconds: number;
                                            };
                                        }[];
                                        completedExams: {
                                            id: string;
                                            completedDate: number;
                                            challengeType?: number;
                                            examResults: {
                                                numberOfCorrectAnswers: number;
                                                numberOfQuestionsInExam: number;
                                                percentCorrect: number;
                                                passingPercent: number;
                                                passed: boolean;
                                                examTimeInSeconds: number;
                                            };
                                        }[];
                                        githubProfile?: string;
                                        is2018DataVisCert: boolean;
                                        is2018FullStackCert: boolean;
                                        isApisMicroservicesCert: boolean;
                                        isBackEndCert: boolean;
                                        isCheater: boolean;
                                        isCollegeAlgebraPyCertV8: boolean;
                                        isDataAnalysisPyCertV7: boolean;
                                        isDataVisCert: boolean;
                                        isDonating: boolean | null;
                                        isFoundationalCSharpCertV8: boolean;
                                        isFrontEndCert: boolean;
                                        isFrontEndLibsCert: boolean;
                                        isFullStackCert: boolean;
                                        isHonest: boolean;
                                        isInfosecCertV7: boolean;
                                        isInfosecQaCert: boolean;
                                        isJsAlgoDataStructCert: boolean;
                                        isJsAlgoDataStructCertV8: boolean;
                                        isMachineLearningPyCertV7: boolean;
                                        isQaCertV7: boolean;
                                        isRelationalDatabaseCertV8: boolean;
                                        isRespWebDesignCert: boolean;
                                        isSciCompPyCertV7: boolean;
                                        linkedin?: string;
                                        location: string;
                                        name: string;
                                        partiallyCompletedChallenges: {
                                            id: string;
                                            completedDate: number;
                                        }[];
                                        picture: string;
                                        points: number | null;
                                        portfolio: {
                                            description: string;
                                            id: string;
                                            image: string;
                                            title: string;
                                            url: string;
                                        }[];
                                        profileUI: {
                                            isLocked?: boolean;
                                            showAbout?: boolean;
                                            showCerts?: boolean;
                                            showDonation?: boolean;
                                            showHeatMap?: boolean;
                                            showLocation?: boolean;
                                            showName?: boolean;
                                            showPoints?: boolean;
                                            showPortfolio?: boolean;
                                            showTimeLine?: boolean;
                                        };
                                        twitter?: string;
                                        website?: string;
                                        yearsTopContributor: string[];
                                        joinDate: string;
                                        savedChallenges: {
                                            id: string;
                                            files: {
                                                contents: string;
                                                key: string;
                                                ext: string;
                                                name: string;
                                                history: string[];
                                            }[];
                                            lastSavedDate: number;
                                        }[];
                                        username: string;
                                        msUsername?: string;
                                    };
                                };
                            };
                            result: string;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            entities?: unknown;
                        } | "This endpoint is no longer available outside of the freeCodeCamp ecosystem";
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            entities?: unknown;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/exists": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query: {
                    username: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            exists: boolean;
                        };
                    };
                };
                /** @description Default Response */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {boolean} */
                            exists: true;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/certificate/showCert/{username}/{certSlug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    certSlug: string;
                    username: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.username-not-found";
                                variables: {
                                    username: string;
                                };
                            }[];
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.not-eligible";
                            }[];
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.not-honest";
                                variables: {
                                    username: string;
                                };
                            }[];
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.profile-private";
                                variables: {
                                    username: string;
                                };
                            }[];
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.add-name";
                            }[];
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.certs-private";
                                variables: {
                                    username: string;
                                };
                            }[];
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.timeline-private";
                                variables: {
                                    username: string;
                                };
                            }[];
                        } | {
                            certSlug: "responsive-web-design" | "javascript-algorithms-and-data-structures-v8" | "front-end-development-libraries" | "data-visualization" | "relational-database-v8" | "back-end-development-and-apis" | "quality-assurance-v7" | "scientific-computing-with-python-v7" | "data-analysis-with-python-v7" | "information-security-v7" | "machine-learning-with-python-v7" | "college-algebra-with-python-v8" | "foundational-c-sharp-with-microsoft" | "full-stack-developer-v9" | "a2-english-for-developers-v8" | "b1-english-for-developers-v8" | "legacy-front-end" | "javascript-algorithms-and-data-structures" | "legacy-back-end" | "legacy-data-visualization" | "information-security-and-quality-assurance" | "full-stack";
                            certTitle: string;
                            username: string;
                            date: number;
                            completionTime: number;
                        } | {
                            certSlug: "responsive-web-design" | "javascript-algorithms-and-data-structures-v8" | "front-end-development-libraries" | "data-visualization" | "relational-database-v8" | "back-end-development-and-apis" | "quality-assurance-v7" | "scientific-computing-with-python-v7" | "data-analysis-with-python-v7" | "information-security-v7" | "machine-learning-with-python-v7" | "college-algebra-with-python-v8" | "foundational-c-sharp-with-microsoft" | "full-stack-developer-v9" | "a2-english-for-developers-v8" | "b1-english-for-developers-v8" | "legacy-front-end" | "javascript-algorithms-and-data-structures" | "legacy-back-end" | "legacy-data-visualization" | "information-security-and-quality-assurance" | "full-stack";
                            certTitle: string;
                            username: string;
                            name: string;
                            date: number;
                            completionTime: number;
                        } | {
                            messages: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "flash.user-not-certified";
                                variables: {
                                    username: string;
                                    cert: string;
                                };
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            messages: {
                                /** @enum {string} */
                                message: "flash.cert-not-found";
                                /** @enum {string} */
                                type: "info";
                                variables: {
                                    certSlug: string;
                                };
                            }[];
                        };
                    };
                };
                /** @description Default Response */
                default: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @enum {string} */
                            message: "flash.generic-error";
                            /** @enum {string} */
                            type: "danger";
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/refetch-user-completed-challenges": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                410: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "Please reload the app, this feature is no longer available.";
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/certificate/verify-can-claim-cert": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                410: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "Please reload the app, this feature is no longer available.";
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/github": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                410: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "Please reload the app, this feature is no longer available.";
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                410: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            message: {
                                /** @enum {string} */
                                type: "info";
                                /** @enum {string} */
                                message: "Please reload the app, this feature is no longer available.";
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/status/ping": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/u/{email}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    email: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/unsubscribe/{email}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    email: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Default Response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
