create table dishes (dish_id int primary key auto_increment, name varchar(63), last_made date, user_id int references users (user_id) on delete cascade)


select dish_id, name, last_made from dishes where user_id = %s order by last_made

update dishes set last_made = sysdate() where dish_id = %s and user_id = %s

insert into users (username, passhash) values (%s, %s)

select user_id, passhash from users where username=%s

insert into dishes (name, last_made, user_id) values (%s, sysdate(), %s)