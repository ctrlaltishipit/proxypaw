import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { ALL_PETS, type PetData } from "./pets-data.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ==================== TYPES ====================
interface VolunteerData {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'walker' | 'renter' | 'owner';
  bgcStatus: 'pending' | 'verified' | 'failed';
  bgcVerifiedAt?: string;
  assignedPets: number[]; // Pet IDs assigned to this volunteer
}

interface PetAssignment {
  petId: number;
  volunteerId: string;
  assignedAt: string;
  assignedBy: string; // Admin user ID
}

// ==================== HELPER FUNCTIONS ====================

// PHI Masking - Masks sensitive owner information
function maskPHI(pet: PetData): any {
  return {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    tower: pet.tower,
    apartment: '****', // Masked
    image: pet.image,
    status: pet.status,
    ownerName: '****** ******', // Masked
    ownerPhone: '***-***-****', // Masked
    ownerEmail: '***@***.**', // Masked
    medicalNotes: '[REDACTED - BGC Required]',
    emergencyContact: '[REDACTED - BGC Required]'
  };
}

// Get unmasked pet data (admin only or assigned volunteer with BGC)
function getUnmaskedPet(pet: PetData, userRole: string, userId: string, volunteer?: VolunteerData): any {
  // Admin can see everything
  if (userRole === 'admin') {
    return pet;
  }

  // Volunteer must be BGC verified and have pet assigned
  if (volunteer && volunteer.bgcStatus === 'verified' && volunteer.assignedPets.includes(pet.id)) {
    return pet;
  }

  // Everyone else gets masked data
  return maskPHI(pet);
}

// ==================== PET MANAGEMENT ROUTES ====================

// Initialize pets database (Admin only - one-time setup)
app.post("/make-server-0cfbd72b/admin/init-pets", async (c) => {
  try {
    const { userRole } = await c.req.json();

    if (userRole !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    // Check if pets already initialized
    const existing = await kv.get('pets_initialized');
    if (existing) {
      return c.json({ message: 'Pets database already initialized', count: 109 }, 200);
    }

    // Store each pet with PHI data
    const petPromises = [];
    
    // All 109 pets with confidential owner data
    const petsData: PetData[] = ALL_PETS;

    for (const pet of petsData) {
      petPromises.push(kv.set(`pet:${pet.id}`, pet));
    }

    await Promise.all(petPromises);
    await kv.set('pets_initialized', true);
    await kv.set('pets_total_count', petsData.length);

    console.log(`Successfully initialized ${petsData.length} pets with PHI data`);
    return c.json({ 
      message: 'Pets database initialized successfully', 
      count: petsData.length,
      security: 'PHI masking enabled for non-admin users'
    }, 201);

  } catch (error) {
    console.error('Error initializing pets database:', error);
    return c.json({ error: 'Failed to initialize pets database', details: error.message }, 500);
  }
});

// Get all pets (with PHI masking based on role and BGC status)
app.post("/make-server-0cfbd72b/pets", async (c) => {
  try {
    const { userId, userRole } = await c.req.json();

    if (!userId || !userRole) {
      return c.json({ error: 'Missing userId or userRole' }, 400);
    }

    // Get volunteer data if not admin
    let volunteer: VolunteerData | null = null;
    if (userRole !== 'admin') {
      volunteer = await kv.get(`volunteer:${userId}`);
    }

    // Get all pets
    const petKeys = await kv.getByPrefix('pet:');
    const pets: PetData[] = petKeys.map(item => item.value);

    // Apply PHI masking based on role and BGC status
    const maskedPets = pets.map(pet => 
      getUnmaskedPet(pet, userRole, userId, volunteer || undefined)
    );

    return c.json({ 
      pets: maskedPets,
      count: maskedPets.length,
      userRole,
      bgcStatus: volunteer?.bgcStatus || 'N/A',
      phiMasking: userRole !== 'admin'
    }, 200);

  } catch (error) {
    console.error('Error fetching pets:', error);
    return c.json({ error: 'Failed to fetch pets', details: error.message }, 500);
  }
});

// Get pets for public map view (GET route with full PHI masking)
app.get("/make-server-0cfbd72b/pets", async (c) => {
  try {
    // Get all pets
    const petKeys = await kv.getByPrefix('pet:');
    const pets: PetData[] = petKeys.map(item => item.value);

    // If no pets found, return the hardcoded data for initial map view
    if (pets.length === 0) {
      return c.json({ 
        pets: ALL_PETS.map(maskPHI),
        count: ALL_PETS.length,
        source: 'default',
        phiMasking: true
      }, 200);
    }

    // Always mask PHI for public map view
    const maskedPets = pets.map(maskPHI);

    return c.json({ 
      pets: maskedPets,
      count: maskedPets.length,
      source: 'database',
      phiMasking: true
    }, 200);

  } catch (error) {
    console.error('Error fetching pets for map:', error);
    return c.json({ error: 'Failed to fetch pets', details: error.message }, 500);
  }
});

// Get single pet (with PHI masking)
app.post("/make-server-0cfbd72b/pets/:id", async (c) => {
  try {
    const petId = parseInt(c.req.param('id'));
    const { userId, userRole } = await c.req.json();

    const pet: PetData | null = await kv.get(`pet:${petId}`);
    if (!pet) {
      return c.json({ error: 'Pet not found' }, 404);
    }

    // Get volunteer data if not admin
    let volunteer: VolunteerData | null = null;
    if (userRole !== 'admin') {
      volunteer = await kv.get(`volunteer:${userId}`);
    }

    const maskedPet = getUnmaskedPet(pet, userRole, userId, volunteer || undefined);

    return c.json({ 
      pet: maskedPet,
      phiMasking: userRole !== 'admin' && (!volunteer || volunteer.bgcStatus !== 'verified' || !volunteer.assignedPets.includes(petId))
    }, 200);

  } catch (error) {
    console.error('Error fetching pet:', error);
    return c.json({ error: 'Failed to fetch pet', details: error.message }, 500);
  }
});

// ==================== VOLUNTEER MANAGEMENT ====================

// Register/Update volunteer
app.post("/make-server-0cfbd72b/volunteers/register", async (c) => {
  try {
    const { userId, name, email, role } = await c.req.json();

    if (!userId || !name || !email || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const volunteer: VolunteerData = {
      userId,
      name,
      email,
      role: role === 'admin' ? 'admin' : (role === 'owner' ? 'owner' : 'walker'),
      bgcStatus: role === 'admin' ? 'verified' : 'pending',
      assignedPets: []
    };

    await kv.set(`volunteer:${userId}`, volunteer);

    return c.json({ 
      message: 'Volunteer registered successfully',
      volunteer: {
        ...volunteer,
        bgcMessage: role === 'admin' ? 'Admin pre-verified' : 'Background check pending'
      }
    }, 201);

  } catch (error) {
    console.error('Error registering volunteer:', error);
    return c.json({ error: 'Failed to register volunteer', details: error.message }, 500);
  }
});

// Admin: Verify BGC for volunteer
app.post("/make-server-0cfbd72b/admin/verify-bgc", async (c) => {
  try {
    const { adminUserId, adminRole, volunteerId, bgcStatus } = await c.req.json();

    if (adminRole !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const volunteer: VolunteerData | null = await kv.get(`volunteer:${volunteerId}`);
    if (!volunteer) {
      return c.json({ error: 'Volunteer not found' }, 404);
    }

    volunteer.bgcStatus = bgcStatus;
    if (bgcStatus === 'verified') {
      volunteer.bgcVerifiedAt = new Date().toISOString();
    }

    await kv.set(`volunteer:${volunteerId}`, volunteer);

    console.log(`BGC ${bgcStatus} for volunteer ${volunteerId} by admin ${adminUserId}`);
    return c.json({ 
      message: `Background check ${bgcStatus} successfully`,
      volunteer
    }, 200);

  } catch (error) {
    console.error('Error verifying BGC:', error);
    return c.json({ error: 'Failed to verify BGC', details: error.message }, 500);
  }
});

// Admin: Assign pet to volunteer
app.post("/make-server-0cfbd72b/admin/assign-pet", async (c) => {
  try {
    const { adminUserId, adminRole, volunteerId, petId } = await c.req.json();

    if (adminRole !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const volunteer: VolunteerData | null = await kv.get(`volunteer:${volunteerId}`);
    if (!volunteer) {
      return c.json({ error: 'Volunteer not found' }, 404);
    }

    if (volunteer.bgcStatus !== 'verified') {
      return c.json({ error: 'Cannot assign pet - Background check not verified' }, 403);
    }

    const pet: PetData | null = await kv.get(`pet:${petId}`);
    if (!pet) {
      return c.json({ error: 'Pet not found' }, 404);
    }

    // Add pet to volunteer's assigned pets
    if (!volunteer.assignedPets.includes(petId)) {
      volunteer.assignedPets.push(petId);
      await kv.set(`volunteer:${volunteerId}`, volunteer);
    }

    // Create assignment record
    const assignment: PetAssignment = {
      petId,
      volunteerId,
      assignedAt: new Date().toISOString(),
      assignedBy: adminUserId
    };
    await kv.set(`assignment:${volunteerId}:${petId}`, assignment);

    console.log(`Pet ${petId} assigned to volunteer ${volunteerId} by admin ${adminUserId}`);
    return c.json({ 
      message: 'Pet assigned successfully',
      assignment,
      volunteer
    }, 200);

  } catch (error) {
    console.error('Error assigning pet:', error);
    return c.json({ error: 'Failed to assign pet', details: error.message }, 500);
  }
});

// Admin: Remove pet assignment
app.post("/make-server-0cfbd72b/admin/unassign-pet", async (c) => {
  try {
    const { adminUserId, adminRole, volunteerId, petId } = await c.req.json();

    if (adminRole !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const volunteer: VolunteerData | null = await kv.get(`volunteer:${volunteerId}`);
    if (!volunteer) {
      return c.json({ error: 'Volunteer not found' }, 404);
    }

    // Remove pet from volunteer's assigned pets
    volunteer.assignedPets = volunteer.assignedPets.filter(id => id !== petId);
    await kv.set(`volunteer:${volunteerId}`, volunteer);

    // Delete assignment record
    await kv.del(`assignment:${volunteerId}:${petId}`);

    console.log(`Pet ${petId} unassigned from volunteer ${volunteerId} by admin ${adminUserId}`);
    return c.json({ 
      message: 'Pet unassigned successfully',
      volunteer
    }, 200);

  } catch (error) {
    console.error('Error unassigning pet:', error);
    return c.json({ error: 'Failed to unassign pet', details: error.message }, 500);
  }
});

// Get volunteer profile with assigned pets
app.post("/make-server-0cfbd72b/volunteers/profile", async (c) => {
  try {
    const { userId } = await c.req.json();

    const volunteer: VolunteerData | null = await kv.get(`volunteer:${userId}`);
    if (!volunteer) {
      return c.json({ error: 'Volunteer not found' }, 404);
    }

    // Get assigned pets (unmasked if BGC verified)
    const assignedPets: PetData[] = [];
    for (const petId of volunteer.assignedPets) {
      const pet: PetData | null = await kv.get(`pet:${petId}`);
      if (pet) {
        assignedPets.push(pet);
      }
    }

    return c.json({ 
      volunteer,
      assignedPets: volunteer.bgcStatus === 'verified' ? assignedPets : assignedPets.map(maskPHI),
      phiAccess: volunteer.bgcStatus === 'verified'
    }, 200);

  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    return c.json({ error: 'Failed to fetch volunteer profile', details: error.message }, 500);
  }
});

// Health check endpoint
app.get("/make-server-0cfbd72b/health", (c) => {
  return c.json({ status: "ok" });
});

Deno.serve(app.fetch);