package com.miniorange.recruitmentmanagementservice.config;

import com.miniorange.recruitmentmanagementservice.entity.MockQuestion;
import com.miniorange.recruitmentmanagementservice.entity.User;
import com.miniorange.recruitmentmanagementservice.enums.MockTestCategory;
import com.miniorange.recruitmentmanagementservice.enums.Role;
import com.miniorange.recruitmentmanagementservice.repository.MockQuestionRepository;
import com.miniorange.recruitmentmanagementservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MockQuestionRepository mockQuestionRepository;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.mobile}")
    private String adminMobile;

    @Value("${app.admin.name}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .fullName(adminName)
                    .mobileNumber(adminMobile)
                    .role(Role.SUPER_ADMIN)
                    .enabled(true)
                    .build();

            userRepository.save(admin);
            log.info("Default SUPER_ADMIN user created with email: {}", adminEmail);
        } else {
            log.info("SUPER_ADMIN user already exists with email: {}", adminEmail);
        }

        seedMockQuestions();
    }

    private void seedMockQuestions() {
        if (mockQuestionRepository.count() > 0) {
            log.info("Mock questions already seeded");
            return;
        }

        log.info("Seeding mock test questions...");

        List<MockQuestion> questions = List.of(
            // ── MARKETING (20 questions) ──
            q(MockTestCategory.MARKETING, "What is the primary goal of SEO?", "Increase paid ads", "Improve organic search visibility", "Reduce website traffic", "Increase bounce rate", "B"),
            q(MockTestCategory.MARKETING, "What does CTR stand for?", "Click Through Rate", "Cost To Revenue", "Customer Tracking Report", "Content Type Ratio", "A"),
            q(MockTestCategory.MARKETING, "Which platform is best for B2B marketing?", "TikTok", "Instagram", "LinkedIn", "Snapchat", "C"),
            q(MockTestCategory.MARKETING, "What is a buyer persona?", "A real customer", "A semi-fictional ideal customer", "A sales target", "A marketing budget", "B"),
            q(MockTestCategory.MARKETING, "What does ROI stand for?", "Return On Investment", "Rate Of Interest", "Revenue On Income", "Risk Of Investment", "A"),
            q(MockTestCategory.MARKETING, "What is content marketing?", "Buying ad space", "Creating valuable content to attract audience", "Cold calling", "Door-to-door sales", "B"),
            q(MockTestCategory.MARKETING, "What is A/B testing?", "Testing two versions to see which performs better", "Testing all versions simultaneously", "A quality check", "A compliance test", "A"),
            q(MockTestCategory.MARKETING, "What is a conversion funnel?", "A physical funnel", "The journey from awareness to purchase", "A data pipeline", "A customer complaint process", "B"),
            q(MockTestCategory.MARKETING, "What is PPC advertising?", "Pay Per Click", "Post Per Content", "Price Per Customer", "Plan Per Campaign", "A"),
            q(MockTestCategory.MARKETING, "What is brand equity?", "Company stock price", "Value derived from consumer perception", "Total revenue", "Number of employees", "B"),
            q(MockTestCategory.MARKETING, "What is email marketing open rate?", "Percentage of emails sent", "Percentage of emails opened", "Percentage of emails bounced", "Percentage of unsubscribes", "B"),
            q(MockTestCategory.MARKETING, "What is market segmentation?", "Dividing market into distinct groups", "Combining all customers", "Ignoring demographics", "Random targeting", "A"),
            q(MockTestCategory.MARKETING, "What is a CTA?", "Call To Action", "Customer Tracking App", "Content Type Analysis", "Cost To Advertise", "A"),
            q(MockTestCategory.MARKETING, "What is influencer marketing?", "Using celebrities for ads only", "Partnering with individuals who have audience influence", "Government marketing", "Internal marketing", "B"),
            q(MockTestCategory.MARKETING, "What is organic reach?", "Paid promotion reach", "Reach without paid promotion", "Farming-related marketing", "Zero reach", "B"),
            q(MockTestCategory.MARKETING, "What is a marketing mix (4Ps)?", "Product, Price, Place, Promotion", "People, Process, Plan, Profit", "Platform, Pay, Produce, Post", "Partner, Price, Plan, Post", "A"),
            q(MockTestCategory.MARKETING, "What is remarketing?", "Marketing to new customers", "Targeting users who previously interacted", "Stopping marketing", "B2B marketing", "B"),
            q(MockTestCategory.MARKETING, "What is a landing page?", "Homepage of a website", "A standalone page for a specific campaign", "An error page", "A login page", "B"),
            q(MockTestCategory.MARKETING, "What is customer lifetime value (CLV)?", "Cost of acquiring a customer", "Total revenue from a customer over time", "One-time purchase value", "Customer age", "B"),
            q(MockTestCategory.MARKETING, "What is guerrilla marketing?", "Military marketing", "Unconventional low-cost marketing tactics", "Online-only marketing", "Premium marketing", "B"),

            // ── BACKEND_DEVELOPER (20 questions) ──
            q(MockTestCategory.BACKEND_DEVELOPER, "What is REST?", "A sleep mode", "Representational State Transfer", "Remote Execution System", "Real-time Event Stream", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What HTTP method is used to update a resource?", "GET", "POST", "PUT", "DELETE", "C"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is dependency injection?", "Injecting SQL", "A design pattern for providing dependencies", "A security vulnerability", "A testing framework", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What does ORM stand for?", "Object Relational Mapping", "Online Resource Manager", "Output Request Module", "Object Runtime Method", "A"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is a microservice?", "A small computer", "A small independent service in a distributed system", "A mini database", "A testing tool", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is SQL injection?", "A database optimization", "A security attack via malicious SQL", "A type of JOIN", "A backup method", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What does ACID stand for in databases?", "Atomicity Consistency Isolation Durability", "Add Create Insert Delete", "Async Connection Interface Design", "Automatic Cache Index Data", "A"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is a JWT?", "Java Web Template", "JSON Web Token", "JavaScript Widget Tool", "Java Worker Thread", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is caching?", "Deleting data", "Storing frequently accessed data for faster retrieval", "Encrypting data", "Compressing files", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What HTTP status code means 'Not Found'?", "200", "301", "404", "500", "C"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is a database index?", "A table of contents for faster queries", "A primary key", "A foreign key", "A database backup", "A"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is middleware?", "Hardware component", "Software between client and server logic", "A database", "A frontend framework", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is an API gateway?", "A physical gateway", "Entry point for API requests with routing/auth", "A database connector", "A file server", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is connection pooling?", "Swimming pool management", "Reusing database connections for efficiency", "Network cable pooling", "Memory allocation", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is the N+1 query problem?", "A math problem", "Fetching related data with excessive queries", "A network issue", "A concurrency bug", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is a message queue?", "An email inbox", "Async communication between services", "A chat application", "A logging system", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is rate limiting?", "Slowing down the server", "Restricting number of requests per time period", "Limiting database size", "Reducing code complexity", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What does CORS stand for?", "Cross-Origin Resource Sharing", "Client Object Request Service", "Cache Optimization Response System", "Connection-Oriented Relay Service", "A"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is database normalization?", "Making data abnormal", "Organizing data to reduce redundancy", "Deleting all data", "Encrypting data", "B"),
            q(MockTestCategory.BACKEND_DEVELOPER, "What is a load balancer?", "A weight scale", "Distributes traffic across multiple servers", "A database tool", "A code compiler", "B"),

            // ── FRONTEND_DEVELOPER (20 questions) ──
            q(MockTestCategory.FRONTEND_DEVELOPER, "What does HTML stand for?", "Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Mail Language", "Home Tool Markup Language", "A"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is the CSS box model?", "A 3D model", "Content, Padding, Border, Margin", "A layout grid", "A color scheme", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is the Virtual DOM?", "A real DOM", "A lightweight copy of the actual DOM", "A server-side concept", "A database", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is JSX?", "JavaScript XML syntax extension", "Java Server Extension", "JSON Schema eXtension", "JavaScript eXecutable", "A"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What does 'useState' do in React?", "Manages component state", "Makes API calls", "Handles routing", "Creates a database", "A"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is responsive design?", "Fast loading pages", "Design that adapts to different screen sizes", "Server-side rendering", "A JavaScript framework", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is Flexbox?", "A gym exercise", "A CSS layout module", "A JavaScript library", "A font type", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is 'useEffect' used for in React?", "Styling components", "Side effects like API calls and subscriptions", "Creating new components", "Routing", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is TypeScript?", "A typed superset of JavaScript", "A new programming language", "A database query language", "A CSS preprocessor", "A"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is the purpose of a key prop in React lists?", "Styling", "Uniquely identifying elements for efficient re-render", "API authentication", "Event handling", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is CSS Grid?", "A spreadsheet tool", "A two-dimensional CSS layout system", "A JavaScript grid library", "An image format", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is event bubbling?", "A sorting algorithm", "Event propagation from child to parent", "A CSS animation", "A memory leak", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is a SPA?", "A relaxation center", "Single Page Application", "Server Processing App", "Standard Protocol API", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is lazy loading?", "Slow coding", "Loading resources only when needed", "Caching everything", "Preloading all assets", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is webpack?", "A travel bag", "A module bundler", "A web server", "A CSS framework", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is the purpose of 'useContext' in React?", "Local state management", "Sharing state across components without prop drilling", "Making API calls", "Routing", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is accessibility (a11y)?", "Website speed", "Making websites usable by everyone including disabled users", "SEO optimization", "Mobile responsiveness", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is SSR?", "Super Simple Rendering", "Server-Side Rendering", "Static Site Reloading", "Secure Socket Routing", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What is a Progressive Web App?", "A slow website", "A web app with native app-like features", "A mobile-only app", "A desktop app", "B"),
            q(MockTestCategory.FRONTEND_DEVELOPER, "What does npm stand for?", "Node Package Manager", "New Programming Module", "Network Protocol Manager", "Null Pointer Module", "A"),

            // ── SALESMAN (20 questions) ──
            q(MockTestCategory.SALESMAN, "What is a sales funnel?", "A kitchen tool", "Stages from prospect to customer", "A database", "A marketing email", "B"),
            q(MockTestCategory.SALESMAN, "What is cold calling?", "Calling in winter", "Contacting prospects without prior relationship", "Calling angry customers", "A phone feature", "B"),
            q(MockTestCategory.SALESMAN, "What is CRM?", "Customer Relationship Management", "Cost Revenue Model", "Client Report Method", "Company Resource Manager", "A"),
            q(MockTestCategory.SALESMAN, "What is upselling?", "Selling upstairs", "Encouraging purchase of a higher-end product", "Selling online", "Discounting", "B"),
            q(MockTestCategory.SALESMAN, "What is a sales quota?", "A type of invoice", "A target amount of sales to achieve", "A discount rate", "A customer complaint", "B"),
            q(MockTestCategory.SALESMAN, "What is objection handling?", "Ignoring customer concerns", "Addressing and resolving customer concerns", "Arguing with customers", "Ending the call", "B"),
            q(MockTestCategory.SALESMAN, "What is a lead?", "A metal", "A potential customer", "A completed sale", "A marketing tool", "B"),
            q(MockTestCategory.SALESMAN, "What is cross-selling?", "Selling across countries", "Offering related products to existing customers", "Angry selling", "Selling at a loss", "B"),
            q(MockTestCategory.SALESMAN, "What is the SPIN selling technique?", "Spinning products", "Situation, Problem, Implication, Need-Payoff", "Speed, Price, Interest, Negotiation", "Sales, Profit, Income, Net", "B"),
            q(MockTestCategory.SALESMAN, "What is a value proposition?", "Product price", "Why a customer should choose your product", "A legal document", "A business plan", "B"),
            q(MockTestCategory.SALESMAN, "What is pipeline management?", "Plumbing", "Tracking and managing sales opportunities", "Email management", "Inventory control", "B"),
            q(MockTestCategory.SALESMAN, "What is a closing technique?", "Shutting a door", "Methods to finalize a sale", "Ending a meeting", "Logging off", "B"),
            q(MockTestCategory.SALESMAN, "What is B2B sales?", "Back to Back sales", "Business to Business sales", "Buy to Build sales", "Basic to Best sales", "B"),
            q(MockTestCategory.SALESMAN, "What is active listening?", "Listening while exercising", "Fully concentrating on what the client says", "Hearing background music", "Recording calls", "B"),
            q(MockTestCategory.SALESMAN, "What is a follow-up?", "A dance move", "Contacting a prospect after initial interaction", "A refund process", "A complaint", "B"),
            q(MockTestCategory.SALESMAN, "What is consultative selling?", "Hard selling", "Understanding client needs and advising solutions", "Selling consulting services", "Online selling", "B"),
            q(MockTestCategory.SALESMAN, "What is a sales pitch?", "A baseball term", "A brief presentation to sell a product", "A discount offer", "A product return", "B"),
            q(MockTestCategory.SALESMAN, "What is churn rate?", "Butter making speed", "Rate at which customers stop buying", "Sales growth rate", "Hiring rate", "B"),
            q(MockTestCategory.SALESMAN, "What is territory management?", "Land surveying", "Managing a defined geographic or market area for sales", "Office management", "HR function", "B"),
            q(MockTestCategory.SALESMAN, "What is social selling?", "Selling at parties", "Using social media to find and engage prospects", "Charity selling", "Group discounts", "B"),

            // ── DESIGNER (20 questions) ──
            q(MockTestCategory.DESIGNER, "What is UX design?", "User Experience design", "Ultra eXtreme design", "Unix design", "Uniform design", "A"),
            q(MockTestCategory.DESIGNER, "What is UI design?", "User Interface design", "Universal Internet design", "Unique Illustration design", "Under Investigation design", "A"),
            q(MockTestCategory.DESIGNER, "What is a wireframe?", "A metal frame", "A basic layout blueprint of a page", "A photograph", "A 3D model", "B"),
            q(MockTestCategory.DESIGNER, "What is a color palette?", "A painting tool", "A set of colors used in a design", "A monitor setting", "A font type", "B"),
            q(MockTestCategory.DESIGNER, "What is typography?", "A printing press", "The art of arranging text", "A programming concept", "A photography style", "B"),
            q(MockTestCategory.DESIGNER, "What is white space?", "Empty areas in a design for readability", "A blank document", "A color", "A bug in design", "A"),
            q(MockTestCategory.DESIGNER, "What is a mockup?", "A joke", "A realistic visual representation of a design", "A wireframe", "A prototype", "B"),
            q(MockTestCategory.DESIGNER, "What is responsive design?", "Fast design", "Design that adapts to different screen sizes", "Print design", "3D design", "B"),
            q(MockTestCategory.DESIGNER, "What is a design system?", "A computer system", "A collection of reusable design components and guidelines", "An operating system", "A file system", "B"),
            q(MockTestCategory.DESIGNER, "What is Figma?", "A fruit", "A collaborative design tool", "A programming language", "A database", "B"),
            q(MockTestCategory.DESIGNER, "What is visual hierarchy?", "Arranging elements by importance", "Sorting files", "A file structure", "A color theory", "A"),
            q(MockTestCategory.DESIGNER, "What is a prototype?", "A finished product", "An interactive model of the design", "A wireframe", "A sketch", "B"),
            q(MockTestCategory.DESIGNER, "What is the golden ratio in design?", "A price ratio", "A proportion (~1.618) found aesthetically pleasing", "A screen resolution", "A color code", "B"),
            q(MockTestCategory.DESIGNER, "What is kerning?", "A cooking term", "Adjusting space between characters", "A color technique", "An animation type", "B"),
            q(MockTestCategory.DESIGNER, "What is a mood board?", "A sad board", "A collection of images/colors for design inspiration", "A whiteboard", "A storyboard", "B"),
            q(MockTestCategory.DESIGNER, "What is contrast in design?", "Similar elements", "Difference between elements to create visual interest", "A font type", "A layout style", "B"),
            q(MockTestCategory.DESIGNER, "What is user testing?", "Testing a user's patience", "Observing real users interact with a design", "Unit testing", "Load testing", "B"),
            q(MockTestCategory.DESIGNER, "What is an icon set?", "A religious set", "A collection of consistent icons for an interface", "A font family", "A color palette", "B"),
            q(MockTestCategory.DESIGNER, "What is a style guide?", "A fashion book", "A document defining design standards", "A coding standard", "A brand name", "B"),
            q(MockTestCategory.DESIGNER, "What does SVG stand for?", "Simple Vector Graphics", "Scalable Vector Graphics", "Standard Visual Graphics", "System Video Generator", "B")
        );

        mockQuestionRepository.saveAll(questions);
        log.info("Seeded {} mock test questions", questions.size());
    }

    private MockQuestion q(MockTestCategory category, String question, String a, String b, String c, String d, String correct) {
        return MockQuestion.builder()
                .category(category)
                .questionText(question)
                .optionA(a)
                .optionB(b)
                .optionC(c)
                .optionD(d)
                .correctOption(correct)
                .build();
    }
}
