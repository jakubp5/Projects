package main.java.model.room;

import main.java.model.common.Obstacle;
import main.java.model.common.Position;
import main.java.model.common.Robot;
import main.java.model.common.Environment;

import main.java.view.MainApp;

/**
 * Represents an autonomous robot in the environment
 */
public class AutonomousRobot implements Robot {
    private final int ROBOT_SIZE = 10;
    private final int OBSTACLE_SIZE = 20;


    private final Environment environment;
    private Position position;
    private double currentAngle;
    private int view_distance = 1;
    private double speed = 1;
    private boolean clockwise = true;
    private int id = 0;
    // defined by user how much the robot will turn
    private double turnAngle = 0;



    private AutonomousRobot(Environment environment, Position position, int view_distance, double speed,
            boolean clockwise, int id, double turnAngle, double currentAngle) {
        this.environment = environment;
        this.position = position;
        this.currentAngle = 0;
        this.view_distance = view_distance;
        this.speed = speed;
        this.clockwise = clockwise;
        this.id = id;
        this.turnAngle = turnAngle;
        this.currentAngle = currentAngle;
    }

    /**
     * Create an autonomous robot at a position
     *
     * @param env           the environment
     * @param pos           the position
     * @param view_distance the view distance
     * @param speed         the speed
     * @param clockwise     the direction of rotation
     * @param id            the id
     * @return the autonomous robot
     */
    public static AutonomousRobot create(Environment env, Position pos, int view_distance, double speed,
            boolean clockwise, int id, double turnAngle, double currentAngle) {
        if (!env.containsPosition(pos) || env.robotAt(pos) || env.obstacleAt(pos)) {
            return null;
        } else {
            AutonomousRobot robot = new AutonomousRobot(env, pos, view_distance, speed, clockwise, id, turnAngle, currentAngle);
            env.addRobot(robot);
            System.out.println("Adding robot " + id);
            return robot;
        }
    }

    public double angle() {
        return currentAngle;
    }

    @Override
    public void turn(int n) {
        if (clockwise) {
            currentAngle = (currentAngle + n * 5) % 360;
        } else {
            currentAngle = (currentAngle + (360 - (n * 5) % 360)) % 360;
        }
    }

    public boolean canMove() {
        // Calculate the next position of the robot
        Position next = getNextPosition(speed);
        double nextX = next.getX();
        double nextY = next.getY();

        // Check if the next position is within the environment boundaries
        if (!environment.containsPosition(next)) {
            return false;
        }

        // Check if the next position is within the bounds of the environment,
        // considering the robot's size
        if (nextX < 5 || nextY < 5 || nextX > environment.getWidth() - 5 || nextY > environment.getHeight() - 5) {
            return false;
        }

        // Check if the next position collides with any obstacle
        for (Obstacle obstacle : environment.getObstacles()) {
            double obstacleX = obstacle.getPosition().getX();
            double obstacleY = obstacle.getPosition().getY();

            // Calculate the minimum and maximum x and y coordinates of the obstacle
            double obstacleMinX = obstacleX - OBSTACLE_SIZE / 2;
            double obstacleMaxX = obstacleX + OBSTACLE_SIZE / 2;
            double obstacleMinY = obstacleY - OBSTACLE_SIZE / 2;
            double obstacleMaxY = obstacleY + OBSTACLE_SIZE / 2;

            // Calculate the closest point on the obstacle's boundary to the next position
            double closestX = Math.max(obstacleMinX, Math.min(nextX, obstacleMaxX));
            double closestY = Math.max(obstacleMinY, Math.min(nextY, obstacleMaxY));

            // Calculate the distance between the closest point and the next position
            double distance = Math.sqrt(Math.pow(nextX - closestX, 2) + Math.pow(nextY - closestY, 2));

            // Check if a collision occurred
            if (distance < ROBOT_SIZE / 2) {
                return false;
            }
        }

        return true;
    }

    public Position getPosition() {
        return position;
    }

    public boolean move() {
        if (canMove()) {
            position = getNextPosition(speed);
            return true;
        } else {
            turn();
        }
        return false;
    }

    public void turn() {
        if (clockwise) {
            currentAngle = (currentAngle + turnAngle) % 360;
        } else {
            currentAngle = (currentAngle + (360 - turnAngle)) % 360;
        }
    }

    /**
     * Get the next position of the robot
     *
     * @return the next position of the robot
     */
    private Position getNextPosition(double distance) {
        double x = position.getX();
        double y = position.getY();

        double rad = Math.toRadians(currentAngle);

        double dx = distance * Math.cos(rad);
        double dy = distance * Math.sin(rad);

        double new_x = x + dx;
        double new_y = y + dy;

        return new Position(new_x, new_y);
    }

    @Override
    public String toString() {
        return "{ \"Controlled\": " + false + ", \"id\": " + id + ", \"x\": " + position.getX() + ", \"y\": "
                + position.getY() + ", \"currentAngle\": " + currentAngle + ", \"speed\": " + speed + ", \"turnAngle\": " + turnAngle + " }";
    }

}