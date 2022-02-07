create table dishes (dish_id int primary key auto_increment, name varchar(63), last_made date, user_id int references users (user_id) on delete cascade)

create table lists (list_item_id int primary key auto_increment, name varchar(63), quantity float, unit varchar(15), checked boolean default false, user_id int references users (user_id) on delete cascade)

-- create table unit_types (unit_type_id int primary key auto_increment, type_name varchar(7) not null, base_name varchar(7) not null)

-- create table units (name varchar(7) primary key, unit_type_id int references unit_types (unit_type_id) on delete set null, factor float, check (unit_type_id is null or factor is not null))

