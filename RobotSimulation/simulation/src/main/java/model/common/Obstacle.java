package main.java.model.common;
/**
 * Represents an obstacle in the environment
 */
public class Obstacle {
    private Environment environment;
    private Position position;

    /**
     * Create an obstacle at a position
     * @param env the environment
     * @param pos the position
     */
    public Obstacle(Environment env, Position pos) {
        this.environment = env;
        this.position = pos;
    }

    /**
     * Get the position of the obstacle
     * @return the position
     */
    public Position getPosition() {
        return this.position;
    }

    /**
     * Get the x coordinate of the obstacle
     * @return the x coordinate
     */
    public double getX() {
        return this.position.getX();
    }

    /**
     * Get the y coordinate of the obstacle
     * @return the y coordinate
     */
    public double getY() {
        return this.position.getY();
    }
    /**
     * Return the obstacle in json format
     * @return the obstacle in json format
     */
    @Override
    public String toString() {
        // json format
        return "{ \"x\": " + this.getX() + ", \"y\": " + this.getY() + " }";
    }

}
