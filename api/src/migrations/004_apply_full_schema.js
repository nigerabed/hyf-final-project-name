// Migration: apply the project's full SQL schema
// This migration executes the canonical SQL schema in a safe, idempotent way
// by using CREATE TABLE IF NOT EXISTS and leaving extension creation in place.
export async function up(knex) {
    // Ensure pgcrypto is available
    await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // Detect users.id column type if the users table already exists.
    let userIdType = null;
    try {
        const res = await knex.raw(
            "SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) AS type FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid WHERE c.relname = 'users' AND a.attname = 'id' LIMIT 1"
        );
        if (res && res.rows && res.rows[0]) userIdType = res.rows[0].type;
    } catch (e) {
        // If the query fails, we'll proceed with sensible defaults.
        console.warn('Could not detect users.id type, defaulting to uuid for new references');
    }

    const userRefIsInteger = userIdType && userIdType.startsWith('integer');

    // Helper to create user reference column matching existing users.id type
    const addUserRef = (table, columnName = 'user_id') => {
        if (userRefIsInteger) {
            table.integer(columnName).unsigned();
        } else {
            table.uuid(columnName);
        }
    };

    // Create tables idempotently using Knex builder to ensure proper types
    if (!(await knex.schema.hasTable('currencies'))) {
        await knex.schema.createTable('currencies', (table) => {
            table.string('code', 3).primary();
            table.string('name', 50).notNullable().unique();
            table.string('symbol', 5);
        });
    }

    if (!(await knex.schema.hasTable('users'))) {
        await knex.schema.createTable('users', (table) => {
            // Create UUID id by default for new installs. Older installs may already
            // have serial integer id created by earlier migrations.
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('username', 50).unique().notNullable();
            table.string('email', 100).unique().notNullable();
            table.string('password', 255).notNullable();
            table.string('first_name', 50).notNullable();
            table.string('last_name', 50).notNullable();
            table.string('mobile', 20).unique().notNullable();
            table.string('profile_image', 255);
            table.string('role', 20).notNullable().defaultTo('user');
            table.boolean('is_active').notNullable().defaultTo(true);
            table.timestamp('email_verified_at');
            table.timestamp('last_login_at');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
    }

    if (!(await knex.schema.hasTable('travel_plans'))) {
        await knex.schema.createTable('travel_plans', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('name', 100).notNullable();
            table.text('description');
            table.date('start_date');
            table.integer('duration_days');
            table.bigInteger('price_minor');
            table.string('currency_code', 3).references('code').inTable('currencies');
            table.integer('capacity');
            table.string('cover_image_url', 255);
            if (userRefIsInteger) table.integer('owner_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
            else table.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL');
            table.string('plan_type', 20).notNullable();
            table.decimal('rating', 3, 2).defaultTo(0.0);
            table.integer('rating_count').defaultTo(0);
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // tour_bookings
    if (!(await knex.schema.hasTable('tour_bookings'))) {
        await knex.schema.createTable('tour_bookings', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.uuid('tour_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.integer('num_travelers').notNullable();
            table.bigInteger('total_price_minor').notNullable();
            table.string('booking_status', 20).notNullable().defaultTo('confirmed');
            table.timestamp('booked_at').defaultTo(knex.fn.now());
            table.unique(['user_id', 'tour_id']);
        });
    }

    // tour_destinations
    if (!(await knex.schema.hasTable('tour_destinations'))) {
        await knex.schema.createTable('tour_destinations', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('tour_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.string('city_name', 100).notNullable();
            table.string('country_name', 100).notNullable();
            table.integer('stop_order').notNullable();
            table.integer('duration_days').notNullable();
            table.unique(['tour_id', 'stop_order']);
        });
    }

    // attraction_posts
    if (!(await knex.schema.hasTable('attraction_posts'))) {
        await knex.schema.createTable('attraction_posts', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('title', 255).notNullable();
            table.text('content').notNullable();
            table.string('location', 100);
            table.string('category', 50);
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // user_posts
    if (!(await knex.schema.hasTable('user_posts'))) {
        await knex.schema.createTable('user_posts', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.uuid('trip_id').references('id').inTable('travel_plans').onDelete('SET NULL');
            table.string('title', 255).notNullable();
            table.text('content').notNullable();
            table.string('category', 50);
            table.string('status', 20).notNullable().defaultTo('published');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // attraction_post_photos
    if (!(await knex.schema.hasTable('attraction_post_photos'))) {
        await knex.schema.createTable('attraction_post_photos', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('post_id').notNullable().references('id').inTable('attraction_posts').onDelete('CASCADE');
            table.string('image_url', 255).notNullable();
            table.string('caption', 255);
            table.timestamp('uploaded_at').defaultTo(knex.fn.now());
        });
    }

    // user_post_photos
    if (!(await knex.schema.hasTable('user_post_photos'))) {
        await knex.schema.createTable('user_post_photos', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('post_id').notNullable().references('id').inTable('user_posts').onDelete('CASCADE');
            table.string('image_url', 255).notNullable();
            table.string('caption', 255);
            table.timestamp('uploaded_at').defaultTo(knex.fn.now());
        });
    }

    // tour_flights
    if (!(await knex.schema.hasTable('tour_flights'))) {
        await knex.schema.createTable('tour_flights', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('tour_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.uuid('departs_from_destination_id').notNullable().references('id').inTable('tour_destinations').onDelete('CASCADE');
            table.uuid('arrives_at_destination_id').notNullable().references('id').inTable('tour_destinations').onDelete('CASCADE');
            table.string('airline', 100);
            table.string('flight_number', 50);
            table.bigInteger('price_minor');
            table.string('currency_code', 3).references('code').inTable('currencies');
        });
    }

    // tour_accommodations
    if (!(await knex.schema.hasTable('tour_accommodations'))) {
        await knex.schema.createTable('tour_accommodations', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('tour_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.uuid('destination_id').notNullable().references('id').inTable('tour_destinations').onDelete('CASCADE');
            table.string('name', 100);
            table.string('type', 50);
            table.decimal('rating', 2, 1);
            table.bigInteger('price_minor');
            table.string('currency_code', 3).references('code').inTable('currencies');
        });
    }

    // tour_reviews
    if (!(await knex.schema.hasTable('tour_reviews'))) {
        await knex.schema.createTable('tour_reviews', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.uuid('tour_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.integer('rating');
            table.text('content').notNullable();
            table.string('status', 20).notNullable().defaultTo('approved');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.unique(['user_id', 'tour_id']);
        });
    }

    // comments
    if (!(await knex.schema.hasTable('comments'))) {
        await knex.schema.createTable('comments', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.text('content').notNullable();
            table.uuid('commentable_id').notNullable();
            table.string('commentable_type', 50).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.string('status', 20).notNullable().defaultTo('approved');
        });
    }

    // trip_collaborators
    if (!(await knex.schema.hasTable('trip_collaborators'))) {
        await knex.schema.createTable('trip_collaborators', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('trip_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            addUserRef(table, 'user_id');
            table.string('permission_level', 20).notNullable().defaultTo('editor');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.unique(['trip_id', 'user_id']);
        });
    }

    // trip_invitations
    if (!(await knex.schema.hasTable('trip_invitations'))) {
        await knex.schema.createTable('trip_invitations', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('trip_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            addUserRef(table, 'created_by_user_id');
            table.text('token').unique().notNullable();
            table.timestamp('expires_at').notNullable();
        });
    }

    // ai_requests
    if (!(await knex.schema.hasTable('ai_requests'))) {
        await knex.schema.createTable('ai_requests', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.text('request_text').notNullable();
            table.uuid('travel_plan_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }

    // trip_itineraries
    if (!(await knex.schema.hasTable('trip_itineraries'))) {
        await knex.schema.createTable('trip_itineraries', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('travel_plan_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.jsonb('itinerary_data').notNullable();
            table.timestamp('generated_at').defaultTo(knex.fn.now());
        });
    }

    // user_favorites
    if (!(await knex.schema.hasTable('user_favorites'))) {
        await knex.schema.createTable('user_favorites', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.uuid('item_id').notNullable();
            table.string('item_type', 20).notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.unique(['user_id', 'item_id', 'item_type']);
        });
    }

    // flights
    if (!(await knex.schema.hasTable('flights'))) {
        await knex.schema.createTable('flights', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('airline', 100).notNullable();
            table.string('flight_number', 50).notNullable();
            table.string('departure_city', 100).notNullable();
            table.string('arrival_city', 100).notNullable();
            table.timestamp('departure_timestamp');
            table.timestamp('arrival_timestamp');
            table.integer('available_seats');
            table.bigInteger('price_minor');
            table.string('currency_code', 3).references('code').inTable('currencies');
            table.unique(['airline', 'flight_number']);
        });
    }

    // accommodations
    if (!(await knex.schema.hasTable('accommodations'))) {
        await knex.schema.createTable('accommodations', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('name', 100).notNullable();
            table.string('city', 100).notNullable();
            table.string('type', 50);
            table.integer('capacity_per_room');
            table.decimal('rating', 2, 1);
            table.bigInteger('price_per_night_minor');
            table.string('currency_code', 3).references('code').inTable('currencies');
        });
    }

    // custom_trip_bookings
    if (!(await knex.schema.hasTable('custom_trip_bookings'))) {
        await knex.schema.createTable('custom_trip_bookings', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            addUserRef(table, 'user_id');
            table.uuid('trip_id').notNullable().references('id').inTable('travel_plans').onDelete('CASCADE');
            table.integer('num_travelers').notNullable();
            table.bigInteger('total_price_minor').notNullable();
            table.string('booking_status', 20).notNullable().defaultTo('confirmed');
            table.timestamp('booked_at').defaultTo(knex.fn.now());
            table.unique(['user_id', 'trip_id']);
        });
    }
}

export async function down(knex) {
    // No-op rollback. Implement conservative drops if needed.
    return Promise.resolve();
}
